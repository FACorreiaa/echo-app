import { FileSpreadsheet, Upload } from "@tamagui/lucide-icons";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Text, XStack, YStack } from "tamagui";

import { Input } from "@/components/Input";

import { GlassyButton } from "@/components/GlassyButton";
import { GlassyCard } from "@/components/GlassyCard";
import { ImportProgress } from "@/components/import/ImportProgress";
import { ImportSuccessSummary } from "@/components/import/ImportSuccessSummary";
import { IngestionPulse } from "@/components/import/IngestionPulse";
import { MappingWizard } from "@/components/import/MappingWizard";
import {
  analyzeFileLocally,
  useAnalyzeCsvFile,
  useAnalyzeFile,
  useImportTransactions,
  type ColumnMapping,
  type FileAnalysis,
} from "@/lib/hooks/use-import";

// Helper to convert URI to bytes (simple version for Expo)
const uriToBytes = async (uri: string): Promise<Uint8Array> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener(
      "load",
      () => {
        resolve(new Uint8Array(reader.result as ArrayBuffer));
      },
      { once: true },
    );
    reader.addEventListener(
      "error",
      () => {
        reject(reader.error ?? new Error("Failed to read file"));
      },
      { once: true },
    );
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Decode bytes to text with encoding fallback.
 * Tries UTF-8 first, then falls back to Windows-1252 (Latin-1 superset)
 * for Portuguese/European bank CSVs that use special characters.
 */
const decodeTextWithFallback = (bytes: Uint8Array): string => {
  // Try UTF-8 first with fatal mode to detect encoding errors
  try {
    const utf8Decoder = new TextDecoder("utf-8", { fatal: true });
    return utf8Decoder.decode(bytes);
  } catch {
    // Fallback to Windows-1252 (common for Portuguese bank exports)
    const latin1Decoder = new TextDecoder("windows-1252");
    return latin1Decoder.decode(bytes);
  }
};

export default function ImportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const importMutation = useImportTransactions();
  const analyzeMutation = useAnalyzeCsvFile();
  const analyzeFileMutation = useAnalyzeFile();

  // State - includes new 'analyzing' step for IngestionPulse
  const [step, setStep] = useState<"upload" | "analyzing" | "mapping" | "importing" | "result">(
    "upload",
  );
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [_mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [bankName, setBankName] = useState("");
  const [importStats, setImportStats] = useState({
    total: 0,
    imported: 0,
    duplicates: 0,
    failed: 0,
    error: "",
    importJobId: "",
  });

  // Reset state when screen is focused (returning to this screen)
  useFocusEffect(
    useCallback(() => {
      // Reset on focus
      setStep("upload");
      setAnalysis(null);
      setFileBytes(null);
      setMapping(null);
      setBankName("");
      setImportStats({
        total: 0,
        imported: 0,
        duplicates: 0,
        failed: 0,
        error: "",
        importJobId: "",
      });
    }, []),
  );

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        // Support CSV, TSV, and Excel files
        type: [
          "text/csv",
          "text/tab-separated-values",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setStep("analyzing"); // Show IngestionPulse while analyzing

      // Read file content for analysis
      const bytes = await uriToBytes(file.uri);
      setFileBytes(bytes);

      // Try smart analysis with routing hint
      try {
        const analysisResult = await analyzeFileMutation.mutateAsync({
          fileBytes: bytes,
          fileName: file.name || "file",
          mimeType: file.mimeType || "",
        });

        console.log("File analysis result:", analysisResult.routingHint, analysisResult.fileType);

        // Route to planning if detected as budget/planning sheet
        if (analysisResult.routingHint === "planning") {
          console.log("Routing to Planning tab - detected budget sheet");
          router.push({
            pathname: "/(tabs)/planning",
            params: {
              fromImport: "true",
              categories: JSON.stringify(analysisResult.planAnalysis?.detectedCategories || []),
            },
          });
          return;
        }

        // Use CSV analysis for transaction import
        if (analysisResult.csvAnalysis) {
          setAnalysis(analysisResult.csvAnalysis);
          setStep("mapping");
          return;
        }
      } catch (smartAnalysisError) {
        console.log("Smart analysis failed, falling back to CSV analysis:", smartAnalysisError);
      }

      // Fallback: try CSV-specific backend analysis
      let resultAnalysis: FileAnalysis;
      try {
        resultAnalysis = await analyzeMutation.mutateAsync(bytes);
        console.log("Using backend CSV analysis");
      } catch (backendError) {
        console.log("Backend analysis failed, using local fallback:", backendError);
        const text = decodeTextWithFallback(bytes);
        resultAnalysis = analyzeFileLocally(text);
      }

      setAnalysis(resultAnalysis);
      setStep("mapping");
    } catch (err) {
      console.error("File selection error:", err);
      setStep("upload"); // Reset on error
    }
  };

  const handleMappingComplete = async (userMapping: ColumnMapping) => {
    if (!fileBytes) return;

    setMapping(userMapping);
    setStep("importing");

    try {
      // Since our proto doesn't support custom mapping yet, we are simulating
      // the "sending mapping" part. In a real scenario, we'd pass the mapping
      // configuration to the backend either in the RPC or save it first.

      // For now, we trust the backend to "figure it out" or we assume
      // we've updated the proto (which is pending).
      // Given the constraints, we will send the format with the request.

      const response = await importMutation.mutateAsync({
        csvBytes: fileBytes,
        dateFormat: userMapping.dateFormat,
        headerRows: analysis?.skipLines ?? 0,
        institutionName: bankName,
        mapping: {
          dateColumn: String(userMapping.dateCol),
          descriptionColumn: String(userMapping.descCol),
          amountColumn: userMapping.amountCol !== undefined ? String(userMapping.amountCol) : "",
          debitColumn: userMapping.debitCol !== undefined ? String(userMapping.debitCol) : "",
          creditColumn: userMapping.creditCol !== undefined ? String(userMapping.creditCol) : "",
          isEuropeanFormat: userMapping.isEuropeanFormat,
          delimiter: analysis?.delimiter ?? ",",
          skipLines: analysis?.skipLines ?? 0,
        },
      });

      setImportStats({
        total: response.importedCount + (response.duplicateCount ?? 0),
        imported: response.importedCount,
        duplicates: response.duplicateCount ?? 0,
        failed: 0,
        error: "",
        importJobId: response.importJobId ?? "",
      });
      setStep("result");
    } catch (err) {
      console.error("Import error:", err);
      setImportStats({
        total: 0,
        imported: 0,
        duplicates: 0,
        failed: 0,
        error: err instanceof Error ? err.message : "Failed to import transactions",
        importJobId: "",
      });
      setStep("result"); // Result will show error state
    }
  };

  const handleCancel = () => {
    // Reset state
    setStep("upload");
    setAnalysis(null);
    setFileBytes(null);
    setMapping(null);
  };

  const handleDone = () => {
    // Navigate to staging view with import job ID if available
    if (importStats.importJobId) {
      router.replace(`/(tabs)/transactions?importJobId=${importStats.importJobId}`);
    } else {
      router.replace("/(tabs)/transactions");
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Header */}
        <XStack alignItems="center" marginBottom="$6" gap="$3">
          <Button
            size="$3"
            circular
            icon={FileSpreadsheet}
            backgroundColor="$accentColor"
            color="white"
            unstyled
          />
          <YStack>
            <H2 color="$color" fontSize={24}>
              Import Transactions
            </H2>
            <Text color="$secondaryText">Add your bank data manually</Text>
          </YStack>
        </XStack>

        {/* content based on step */}
        <YStack gap="$6" flex={1}>
          {step === "upload" && (
            <YStack gap="$4">
              <GlassyCard>
                <YStack alignItems="center" gap="$4" paddingVertical="$8">
                  <YStack
                    backgroundColor="$backgroundHover"
                    padding="$5"
                    borderRadius={999}
                    borderColor="$borderColor"
                    borderWidth={1}
                  >
                    <Upload size={32} color="$accentColor" />
                  </YStack>
                  <YStack alignItems="center" gap="$1">
                    <Text color="$color" fontSize={18} fontWeight="bold">
                      Upload CSV, TSV, or Excel
                    </Text>
                    <Text color="$secondaryText" textAlign="center">
                      Select a bank statement or budget file.
                    </Text>
                  </YStack>
                  <GlassyButton onPress={handleSelectFile} marginTop="$2">
                    Select File
                  </GlassyButton>
                </YStack>
              </GlassyCard>

              {/* Supported formats info */}
              <YStack paddingHorizontal="$4" gap="$2">
                <Text
                  color="$secondaryText"
                  fontSize={12}
                  textTransform="uppercase"
                  fontWeight="bold"
                >
                  Supported Banks
                </Text>
                <XStack flexWrap="wrap" gap="$2">
                  {["Revolut", "Caixa Geral", "Santander", "Millennium", "ActivoBank"].map(
                    (bank) => (
                      <Text
                        key={bank}
                        backgroundColor="$backgroundHover"
                        color="$secondaryText"
                        paddingHorizontal="$3"
                        paddingVertical="$1.5"
                        borderRadius="$4"
                        fontSize={12}
                      >
                        {bank}
                      </Text>
                    ),
                  )}
                </XStack>
              </YStack>
            </YStack>
          )}

          {/* Analyzing state with IngestionPulse */}
          {step === "analyzing" && (
            <YStack flex={1} minHeight={300}>
              <IngestionPulse />
            </YStack>
          )}

          {step === "mapping" && analysis && (
            <YStack gap="$4">
              {/* Bank name selection */}
              <GlassyCard>
                <YStack gap="$2">
                  <Text color="$color" fontWeight="bold">
                    Bank / Institution
                  </Text>
                  <Text color="$secondaryText" fontSize={12}>
                    Select or enter the bank name for this import
                  </Text>
                  <XStack flexWrap="wrap" gap="$2" marginTop="$2">
                    {[
                      "Revolut",
                      "CGD",
                      "Santander",
                      "Millennium",
                      "ActivoBank",
                      "Moey",
                      "Other",
                    ].map((bank) => (
                      <Button
                        key={bank}
                        size="$2"
                        backgroundColor={bankName === bank ? "$accentColor" : "$backgroundHover"}
                        color={bankName === bank ? "white" : "$secondaryText"}
                        onPress={() => setBankName(bank === "Other" ? "" : bank)}
                        borderRadius="$4"
                      >
                        {bank}
                      </Button>
                    ))}
                  </XStack>
                  {bankName === "" && (
                    <Input
                      placeholder="Enter bank name..."
                      value={bankName}
                      onChangeText={setBankName}
                      marginTop="$2"
                    />
                  )}
                </YStack>
              </GlassyCard>

              <MappingWizard
                analysis={analysis}
                onComplete={handleMappingComplete}
                onCancel={handleCancel}
                isLoading={importMutation.isPending}
              />
            </YStack>
          )}

          {/* Combined Importing / Result view */}
          {step === "importing" && (
            <YStack gap="$4">
              <ImportProgress
                status="importing"
                rowsTotal={importStats.total || (analysis?.sampleRows.length ?? 0) + 12}
                rowsImported={importStats.imported}
                rowsFailed={importStats.failed}
              />
            </YStack>
          )}

          {/* Success view with ImportSuccessSummary */}
          {step === "result" && (
            <>
              {importStats.error ? (
                <YStack gap="$4">
                  <ImportProgress status="error" errorMessage={importStats.error} />
                  <GlassyButton onPress={handleCancel}>Try Again</GlassyButton>
                </YStack>
              ) : (
                <ImportSuccessSummary
                  count={importStats.imported}
                  totalMinor={0} // TODO: Calculate from actual transactions
                  duplicates={importStats.duplicates}
                  onDone={handleDone}
                />
              )}
            </>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
