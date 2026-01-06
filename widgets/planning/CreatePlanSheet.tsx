/**
 * CreatePlanSheet - Modal for creating new plans (manual or Excel import)
 */

import { Check, FileSpreadsheet, Pencil, Upload, X } from "@tamagui/lucide-icons";
import * as DocumentPicker from "expo-document-picker";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable } from "react-native";
import { Button, Input, Label, ScrollView, Sheet, Text, TextArea, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import {
  useAnalyzeExcel,
  useCreatePlan,
  useImportFromExcel,
  type ExcelSheetInfo,
} from "@/lib/hooks/use-plans";

type CreateMode = "select" | "manual" | "excel" | "analyze" | "select-sheet";

interface CreatePlanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanCreated?: (plan: { id: string; name: string }) => void;
  initialCategories?: string[]; // From Excel import
}

export function CreatePlanSheet({
  open,
  onOpenChange,
  onPlanCreated,
  initialCategories,
}: CreatePlanSheetProps) {
  const [mode, setMode] = useState<CreateMode>(initialCategories ? "manual" : "select");
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<{ name: string; uri: string } | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [analyzedSheets, setAnalyzedSheets] = useState<ExcelSheetInfo[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>("");

  // Effect to set mode if initials change (e.g. re-opening)
  React.useEffect(() => {
    if (initialCategories && open) {
      setMode("manual");
      setDescription("Imported from Excel budget");
    }
  }, [initialCategories, open]);

  const createPlan = useCreatePlan();
  const analyzeExcel = useAnalyzeExcel();
  const importFromExcel = useImportFromExcel();

  const resetForm = () => {
    setMode("select");
    setPlanName("");
    setDescription("");
    setSelectedFile(null);
    setFileId(null);
    setAnalyzedSheets([]);
    setSelectedSheet("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreateManual = async () => {
    if (!planName.trim()) {
      Alert.alert("Error", "Please enter a plan name");
      return;
    }

    try {
      await createPlan.mutateAsync({
        name: planName.trim(),
        description: description.trim() || undefined,
        currencyCode: "EUR",
        // Use imported categories if available, otherwise default structure
        categoryGroups: initialCategories?.length
          ? [
              {
                name: "Imported Rules",
                color: "#6366f1",
                targetPercent: 100,
                categories: initialCategories.map((c) => ({
                  name: c,
                  items: [],
                  labels: {},
                })),
                labels: {},
              },
            ]
          : [
              {
                name: "Necessities",
                color: "#22c55e",
                targetPercent: 50,
                labels: { en: "Necessities", pt: "Necessidades" },
                categories: [],
              },
              {
                name: "Wants",
                color: "#f59e0b",
                targetPercent: 30,
                labels: { en: "Wants", pt: "Desejos" },
                categories: [],
              },
              {
                name: "Savings",
                color: "#6366f1",
                targetPercent: 20,
                labels: { en: "Savings", pt: "Poupança" },
                categories: [],
              },
            ],
      });
      // Notify parent with the created plan
      if (onPlanCreated) {
        onPlanCreated({ id: "new", name: planName.trim() });
      }
      handleClose();
    } catch {
      Alert.alert("Error", "Failed to create plan");
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-excel",
        ],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setSelectedFile({ name: file.name, uri: file.uri });
    } catch {
      Alert.alert("Error", "Failed to pick file");
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      Alert.alert("Error", "Please select an Excel file");
      return;
    }

    try {
      setMode("analyze"); // Show loading state

      // Step 1: Upload file to storage
      const { uploadExcelFile } = await import("@/lib/hooks/use-plans");
      const { fileId: uploadedFileId } = await uploadExcelFile(selectedFile.uri, selectedFile.name);
      setFileId(uploadedFileId);

      // Step 2: Analyze the Excel file
      const analysisResult = await analyzeExcel.mutateAsync({ fileId: uploadedFileId });
      setAnalyzedSheets(analysisResult.sheets);

      // Default to suggested sheet
      if (analysisResult.suggestedSheet) {
        setSelectedSheet(analysisResult.suggestedSheet);
      } else if (analysisResult.sheets.length > 0) {
        setSelectedSheet(analysisResult.sheets[0].name);
      }

      // Step 3: Show sheet selection
      setMode("select-sheet");
    } catch (error) {
      console.error("Excel import error:", error);
      Alert.alert(
        "Import Failed",
        error instanceof Error ? error.message : "Failed to analyze Excel file",
      );
      setMode("excel"); // Go back to file selection
    }
  };

  const handleSheetImport = async () => {
    if (!fileId || !selectedSheet) {
      Alert.alert("Error", "Please select a sheet");
      return;
    }

    try {
      // Find the selected sheet's analysis data to get detected mapping
      const sheetInfo = analyzedSheets.find((s) => s.name === selectedSheet);
      const detectedMapping = sheetInfo?.detectedMapping;

      await importFromExcel.mutateAsync({
        fileId,
        sheetName: selectedSheet,
        // Pass the detected column mapping so the backend uses correct columns
        mapping: detectedMapping
          ? {
              categoryColumn: detectedMapping.categoryColumn ?? "A",
              valueColumn: detectedMapping.valueColumn ?? "C",
              headerRow: detectedMapping.headerRow ?? 1,
              hasPercentageColumn: !!detectedMapping.percentageColumn,
              percentageColumn: detectedMapping.percentageColumn ?? "",
            }
          : undefined,
      });
      handleClose();
    } catch {
      Alert.alert("Error", "Failed to import plan from Excel");
    }
  };

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[85]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Frame
        backgroundColor="$background"
        padding="$4"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        <Sheet.Handle />

        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$4" marginBottom="$6">
          <Text color="$color" fontSize={24} fontWeight="bold">
            {mode === "select"
              ? "Create Plan"
              : mode === "manual"
                ? "Manual Plan"
                : "Import from Excel"}
          </Text>
          <Pressable onPress={handleClose}>
            <X size={24} color="$secondaryText" />
          </Pressable>
        </XStack>

        {/* Mode Selection */}
        {mode === "select" && (
          <YStack gap="$4">
            <Text color="$secondaryText" marginBottom="$2">
              Choose how you want to create your financial plan:
            </Text>

            {/* Manual Option */}
            <Pressable onPress={() => setMode("manual")}>
              <GlassyCard>
                <XStack padding="$4" alignItems="center" gap="$4">
                  <YStack
                    backgroundColor="$accentColor"
                    width={56}
                    height={56}
                    borderRadius={28}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Pencil size={28} color="white" />
                  </YStack>
                  <YStack flex={1}>
                    <Text color="$color" fontWeight="600" fontSize={18}>
                      Create Manually
                    </Text>
                    <Text color="$secondaryText" fontSize={14}>
                      Build your budget from scratch with our guided setup
                    </Text>
                  </YStack>
                </XStack>
              </GlassyCard>
            </Pressable>

            {/* Excel Option */}
            <Pressable onPress={() => setMode("excel")}>
              <GlassyCard>
                <XStack padding="$4" alignItems="center" gap="$4">
                  <YStack
                    backgroundColor="#22c55e"
                    width={56}
                    height={56}
                    borderRadius={28}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FileSpreadsheet size={28} color="white" />
                  </YStack>
                  <YStack flex={1}>
                    <Text color="$color" fontWeight="600" fontSize={18}>
                      Import from Excel
                    </Text>
                    <Text color="$secondaryText" fontSize={14}>
                      Upload your existing spreadsheet and we&apos;ll convert it
                    </Text>
                  </YStack>
                </XStack>
              </GlassyCard>
            </Pressable>

            {/* Template Option - Coming Soon */}
            <GlassyCard opacity={0.6}>
              <XStack padding="$4" alignItems="center" gap="$4">
                <YStack
                  backgroundColor="$backgroundHover"
                  width={56}
                  height={56}
                  borderRadius={28}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={28}>📋</Text>
                </YStack>
                <YStack flex={1}>
                  <XStack alignItems="center" gap="$2">
                    <Text color="$color" fontWeight="600" fontSize={18}>
                      Use Template
                    </Text>
                    <Text
                      color="$accentColor"
                      fontSize={10}
                      fontWeight="bold"
                      backgroundColor="$accentColor"
                      opacity={0.2}
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius="$1"
                    >
                      SOON
                    </Text>
                  </XStack>
                  <Text color="$secondaryText" fontSize={14}>
                    Start with a pre-made template (50/30/20, etc.)
                  </Text>
                </YStack>
              </XStack>
            </GlassyCard>
          </YStack>
        )}

        {/* Manual Creation Form */}
        {mode === "manual" && (
          <YStack gap="$4" flex={1}>
            <YStack gap="$2">
              <Label htmlFor="plan-name" color="$color">
                Plan Name *
              </Label>
              <Input
                id="plan-name"
                placeholder="e.g., 2026 Budget, House Savings Plan"
                value={planName}
                onChangeText={((text: string) => setPlanName(text)) as any}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                color="$color"
              />
            </YStack>

            <YStack gap="$2">
              <Label htmlFor="plan-desc" color="$color">
                Description (optional)
              </Label>
              <TextArea
                id="plan-desc"
                placeholder="What is this plan for?"
                value={description}
                onChangeText={((text: string) => setDescription(text)) as any}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                color="$color"
                numberOfLines={3}
              />
            </YStack>

            <YStack backgroundColor="$backgroundHover" padding="$3" borderRadius="$3" gap="$1">
              <Text color="$color" fontWeight="600" fontSize={14}>
                💡 Your plan will start with:
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • 50% Necessities (housing, utilities, food)
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • 30% Wants (entertainment, shopping)
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • 20% Savings (investments, emergency fund)
              </Text>
              <Text color="$secondaryText" fontSize={12} marginTop="$1">
                You can customize percentages and categories after creation.
              </Text>
            </YStack>

            <YStack flex={1} />

            <XStack gap="$3">
              <Button
                flex={1}
                backgroundColor="$backgroundHover"
                color="$color"
                onPress={() => setMode("select")}
              >
                Back
              </Button>
              <Button
                flex={2}
                backgroundColor="$accentColor"
                color="white"
                onPress={handleCreateManual}
                disabled={createPlan.isPending}
              >
                {createPlan.isPending ? "Creating..." : "Create Plan"}
              </Button>
            </XStack>
          </YStack>
        )}

        {/* Excel Import Form */}
        {mode === "excel" && (
          <YStack gap="$4" flex={1}>
            <Text color="$secondaryText">
              Upload your Excel spreadsheet and we&apos;ll automatically detect categories, amounts,
              and formulas to create your plan.
            </Text>

            {/* File Picker */}
            <Pressable onPress={handlePickFile}>
              <YStack
                borderWidth={2}
                borderColor={selectedFile ? "$accentColor" : "$borderColor"}
                borderStyle="dashed"
                borderRadius="$4"
                padding="$6"
                alignItems="center"
                justifyContent="center"
                gap="$3"
                backgroundColor={selectedFile ? "$accentColor" : "transparent"}
                opacity={selectedFile ? 0.1 : 1}
              >
                <Upload size={40} color={selectedFile ? "$accentColor" : "$secondaryText"} />
                {selectedFile ? (
                  <YStack alignItems="center">
                    <Text color="$color" fontWeight="600">
                      {selectedFile.name}
                    </Text>
                    <Text color="$secondaryText" fontSize={12}>
                      Tap to change file
                    </Text>
                  </YStack>
                ) : (
                  <YStack alignItems="center">
                    <Text color="$color" fontWeight="600">
                      Select Excel File
                    </Text>
                    <Text color="$secondaryText" fontSize={12}>
                      .xlsx or .xls files supported
                    </Text>
                  </YStack>
                )}
              </YStack>
            </Pressable>

            <YStack backgroundColor="$backgroundHover" padding="$3" borderRadius="$3" gap="$1">
              <Text color="$color" fontWeight="600" fontSize={14}>
                📊 What we&apos;ll import:
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • Categories and subcategories
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • Budget amounts and formulas
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • Monthly/yearly structure
              </Text>
            </YStack>

            <YStack flex={1} />

            <XStack gap="$3">
              <Button
                flex={1}
                backgroundColor="$backgroundHover"
                color="$color"
                onPress={() => {
                  setSelectedFile(null);
                  setMode("select");
                }}
              >
                Back
              </Button>
              <Button
                flex={2}
                backgroundColor="#22c55e"
                color="white"
                onPress={handleImportExcel}
                disabled={!selectedFile}
                opacity={selectedFile ? 1 : 0.5}
              >
                Analyze & Import
              </Button>
            </XStack>
          </YStack>
        )}

        {/* Analyzing State */}
        {mode === "analyze" && (
          <YStack flex={1} alignItems="center" justifyContent="center" gap="$4">
            <ActivityIndicator size="large" color="#22c55e" />
            <Text color="$color" fontWeight="600" fontSize={18}>
              Analyzing Excel file...
            </Text>
            <Text color="$secondaryText" textAlign="center">
              Detecting sheets, categories, and formulas
            </Text>
          </YStack>
        )}

        {/* Sheet Selection */}
        {mode === "select-sheet" && (
          <YStack gap="$4" flex={1}>
            <Text color="$secondaryText">Select the sheet to import from your spreadsheet:</Text>

            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
              showsVerticalScrollIndicator={true}
            >
              {analyzedSheets.map((sheet) => (
                <Pressable key={sheet.name} onPress={() => setSelectedSheet(sheet.name)}>
                  <GlassyCard>
                    <XStack padding="$3" alignItems="center" gap="$3">
                      <YStack
                        width={24}
                        height={24}
                        borderRadius={12}
                        borderWidth={2}
                        borderColor={selectedSheet === sheet.name ? "#22c55e" : "$borderColor"}
                        backgroundColor={selectedSheet === sheet.name ? "#22c55e" : "transparent"}
                        alignItems="center"
                        justifyContent="center"
                      >
                        {selectedSheet === sheet.name && <Check size={14} color="white" />}
                      </YStack>
                      <YStack flex={1}>
                        <Text color="$color" fontWeight="600">
                          {sheet.name}
                        </Text>
                        <Text color="$secondaryText" fontSize={12}>
                          {sheet.rowCount} rows • {sheet.formulaCount} formulas
                          {sheet.isLivingPlan && " • 📊 Living Plan"}
                        </Text>
                        {sheet.detectedCategories.length > 0 && (
                          <Text color="$secondaryText" fontSize={11}>
                            Categories: {sheet.detectedCategories.slice(0, 3).join(", ")}
                            {sheet.detectedCategories.length > 3 && "..."}
                          </Text>
                        )}
                      </YStack>
                    </XStack>
                  </GlassyCard>
                </Pressable>
              ))}
            </ScrollView>

            <YStack flex={1} />

            <XStack gap="$3">
              <Button
                flex={1}
                backgroundColor="$backgroundHover"
                color="$color"
                onPress={() => {
                  setMode("excel");
                  setAnalyzedSheets([]);
                  setSelectedSheet("");
                }}
              >
                Back
              </Button>
              <Button
                flex={2}
                backgroundColor="#22c55e"
                color="white"
                onPress={handleSheetImport}
                disabled={!selectedSheet || importFromExcel.isPending}
              >
                {importFromExcel.isPending ? "Importing..." : "Import Selected Sheet"}
              </Button>
            </XStack>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
