import { FileSpreadsheet, Upload } from "@tamagui/lucide-icons";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Text, XStack, YStack } from "tamagui";

import { GlassyButton } from "@/components/GlassyButton";
import { GlassyCard } from "@/components/GlassyCard";
import { ImportProgress } from "@/components/import/ImportProgress";
import { MappingWizard } from "@/components/import/MappingWizard";
import {
  analyzeFileLocally,
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
    reader.onload = () => {
      resolve(new Uint8Array(reader.result as ArrayBuffer));
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export default function ImportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const importMutation = useImportTransactions();

  // State
  const [step, setStep] = useState<"upload" | "mapping" | "importing" | "result">("upload");
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null);
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [_mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [importStats, setImportStats] = useState({
    total: 0,
    imported: 0,
    failed: 0,
    error: "",
  });

  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/tab-separated-values", "application/vnd.ms-excel", "text/plain"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setStep("upload"); // Show uploading state if we had one

      // Read file content for analysis
      // Note: For large files, we might want to read chunks
      const bytes = await uriToBytes(file.uri);
      const text = new TextDecoder("utf-8").decode(bytes);

      setFileBytes(bytes);

      // Analyze locally
      const resultAnalysis = analyzeFileLocally(text);
      setAnalysis(resultAnalysis);
      setStep("mapping");
    } catch (err) {
      console.error("File selection error:", err);
      // Show error toast
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
        mapping: {
          dateColumn: String(userMapping.dateCol),
          descriptionColumn: String(userMapping.descCol),
          amountColumn: userMapping.amountCol !== undefined ? String(userMapping.amountCol) : "",
          debitColumn: userMapping.debitCol !== undefined ? String(userMapping.debitCol) : "",
          creditColumn: userMapping.creditCol !== undefined ? String(userMapping.creditCol) : "",
        },
      });

      setImportStats({
        total: response.importedCount,
        imported: response.importedCount,
        failed: 0,
        error: "",
      });
      setStep("result");
    } catch (err) {
      console.error("Import error:", err);
      setImportStats({
        total: 0,
        imported: 0,
        failed: 0,
        error: err instanceof Error ? err.message : "Failed to import transactions",
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
    router.replace("/(tabs)");
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
                      Upload CSV / TSV
                    </Text>
                    <Text color="$secondaryText" textAlign="center">
                      Select a bank statement file from your device.
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

          {step === "mapping" && analysis && (
            <MappingWizard
              analysis={analysis}
              onComplete={handleMappingComplete}
              onCancel={handleCancel}
              isLoading={importMutation.isPending}
            />
          )}

          {/* Combined Importing / Result view */}
          {(step === "importing" || step === "result") && (
            <YStack gap="$4">
              <ImportProgress
                status={
                  step === "importing" ? "importing" : importStats.error ? "error" : "success"
                }
                rowsTotal={importStats.total || (analysis?.sampleRows.length ?? 0) + 12} // Fake total for now
                rowsImported={importStats.imported}
                rowsFailed={importStats.failed}
                errorMessage={importStats.error}
              />

              {step === "result" && <GlassyButton onPress={handleDone}>Done</GlassyButton>}
            </YStack>
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
