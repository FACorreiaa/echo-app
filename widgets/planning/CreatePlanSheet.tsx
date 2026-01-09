/**
 * CreatePlanSheet - Modal for creating new plans (manual or Excel import)
 */

import { SuggestionCard, type ImportSuggestion } from "@/widgets/staging/SuggestionCard";
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
import { CategoryGroupBuilder, type BuilderGroup } from "./CategoryGroupBuilder";

type CreateMode =
  | "select"
  | "manual"
  | "build-structure" // NEW: Category builder step
  | "excel"
  | "analyze"
  | "select-sheet"
  | "confirm-mapping"
  | "review-suggestions";

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

  // Smart Mapper: user-editable mapping with overrides
  const [mappingOverrides, setMappingOverrides] = useState<{
    categoryColumn: string;
    valueColumn: string;
    headerRow: number;
    startCell?: string; // Optional: specific cell coordinate like "B10"
  } | null>(null);

  // Staging Area: detected suggestions from Excel parse
  const [detectedSuggestions, setDetectedSuggestions] = useState<ImportSuggestion[]>([]);

  // Category Builder: for manual plan structure
  const [builderGroups, setBuilderGroups] = useState<BuilderGroup[]>([]);

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
    setBuilderGroups([]);
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
      // Convert builderGroups to API format
      const categoryGroupsPayload =
        builderGroups.length > 0
          ? builderGroups.map((group) => ({
              name: group.name,
              color: group.color,
              targetPercent: group.targetPercent,
              categories: group.categories.map((cat) => ({
                name: cat.name,
                icon: cat.icon ?? "",
                items: cat.items.map((item) => ({
                  name: item.name,
                  budgetedMinor: BigInt(item.budgetedMinor ?? 0),
                  configId: item.configId,
                  itemType: item.itemType,
                  initialActualMinor: item.initialActualMinor
                    ? BigInt(item.initialActualMinor)
                    : undefined,
                  labels: {},
                })),
                labels: {},
              })),
              labels: {},
            }))
          : initialCategories?.length
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
              ];

      await createPlan.mutateAsync({
        name: planName.trim(),
        description: description.trim() || undefined,
        currencyCode: "EUR",
        categoryGroups: categoryGroupsPayload,
      });
      // Notify parent with the created plan
      if (onPlanCreated) {
        onPlanCreated({ id: "new", name: planName.trim() });
      }
      handleClose();
    } catch (error) {
      console.error("[CreatePlan] Error creating plan:", error);
      Alert.alert(
        "Error",
        `Failed to create plan: ${error instanceof Error ? error.message : String(error)}`,
      );
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

  // Transition to Smart Mapper step when a sheet is selected
  const handleGoToConfirmMapping = () => {
    if (!selectedSheet) {
      Alert.alert("Error", "Please select a sheet");
      return;
    }

    // Find selected sheet's detected mapping and pre-populate overrides
    const sheetInfo = analyzedSheets.find((s) => s.name === selectedSheet);
    const detected = sheetInfo?.detectedMapping;

    setMappingOverrides({
      categoryColumn: detected?.categoryColumn ?? "A",
      valueColumn: detected?.valueColumn ?? "C",
      headerRow: detected?.headerRow ?? 1,
    });

    setMode("confirm-mapping");
  };

  const handleSheetImport = async () => {
    if (!fileId || !selectedSheet) {
      Alert.alert("Error", "Please select a sheet");
      return;
    }

    try {
      // Use user overrides if available, otherwise fall back to detected mapping
      const sheetInfo = analyzedSheets.find((s) => s.name === selectedSheet);
      const detected = sheetInfo?.detectedMapping;

      const finalMapping = mappingOverrides ?? {
        categoryColumn: detected?.categoryColumn ?? "A",
        valueColumn: detected?.valueColumn ?? "C",
        headerRow: detected?.headerRow ?? 1,
      };

      await importFromExcel.mutateAsync({
        fileId,
        sheetName: selectedSheet,
        mapping: {
          categoryColumn: finalMapping.categoryColumn,
          valueColumn: finalMapping.valueColumn,
          headerRow: finalMapping.headerRow,
          hasPercentageColumn: !!detected?.percentageColumn,
          percentageColumn: detected?.percentageColumn ?? "",
          startCell: finalMapping.startCell ?? "",
        },
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
            <Pressable onPress={() => setMode("build-structure")}>
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
                onPress={() => setMode("build-structure")}
                disabled={!planName.trim()}
              >
                Build Budget Structure →
              </Button>
            </XStack>
          </YStack>
        )}

        {/* Build Structure - CategoryGroupBuilder Step */}
        {mode === "build-structure" && (
          <YStack gap="$4" flex={1}>
            {/* Inline Plan Name Input */}
            <Input
              placeholder="Plan name (e.g., 2026 Budget)"
              value={planName}
              onChangeText={((text: string) => setPlanName(text)) as any}
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              color="$color"
              size="$5"
            />
            <Text color="$secondaryText" fontSize={14}>
              Add category groups (like "Fundamentals", "Fun"), then add categories and line items
              to each. Mark each item as Budget, Recurring, or Savings Goal.
            </Text>

            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              <CategoryGroupBuilder groups={builderGroups} onChange={setBuilderGroups} />
            </ScrollView>

            <XStack gap="$3" marginTop="$2">
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
                disabled={createPlan.isPending || builderGroups.length === 0 || !planName.trim()}
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
                onPress={handleGoToConfirmMapping}
                disabled={!selectedSheet}
              >
                Review Mapping
              </Button>
            </XStack>
          </YStack>
        )}

        {mode === "confirm-mapping" && mappingOverrides && (
          <YStack gap="$4" flex={1}>
            <ScrollView
              contentContainerStyle={{ flexGrow: 1, gap: 16 }}
              showsVerticalScrollIndicator
            >
              <Text color="$secondaryText">
                Review the detected column mapping before importing:
              </Text>

              {/* Confidence Summary */}
              {(() => {
                const sheetInfo = analyzedSheets.find((s) => s.name === selectedSheet);
                const confidence = sheetInfo?.detectedMapping?.confidence ?? 0.5;
                const isHigh = confidence >= 0.85;
                const isMedium = confidence >= 0.5 && confidence < 0.85;

                return (
                  <GlassyCard>
                    <XStack padding="$3" alignItems="center" gap="$3">
                      <Text fontSize={24}>{isHigh ? "🟢" : isMedium ? "🟡" : "🔴"}</Text>
                      <YStack flex={1}>
                        <Text color="$color" fontWeight="600">
                          {isHigh
                            ? "High Confidence"
                            : isMedium
                              ? "Review Recommended"
                              : "Manual Review Needed"}
                        </Text>
                        <Text color="$secondaryText" fontSize={12}>
                          Detection confidence: {Math.round(confidence * 100)}%
                        </Text>
                      </YStack>
                    </XStack>
                  </GlassyCard>
                );
              })()}

              {/* Row Preview */}
              {(() => {
                const sheetInfo = analyzedSheets.find((s) => s.name === selectedSheet);
                const previewRows = sheetInfo?.previewRows ?? [];

                if (previewRows.length === 0) return null;

                return (
                  <GlassyCard>
                    <YStack gap="$2">
                      <Text
                        color="$secondaryText"
                        fontSize={12}
                        fontWeight="600"
                        padding="$3"
                        paddingBottom={0}
                      >
                        DATA PREVIEW
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator>
                        <YStack>
                          {previewRows.map((row, rowIdx) => (
                            <XStack
                              key={rowIdx}
                              padding="$2"
                              gap="$3"
                              backgroundColor={rowIdx === 0 ? "$listItemBackground" : undefined}
                              borderBottomWidth={1}
                              borderColor="$borderColor"
                            >
                              {row.map((cell, cellIdx) => (
                                <Text
                                  key={cellIdx}
                                  width={100}
                                  color={rowIdx === 0 ? "$color" : "$secondaryText"}
                                  fontWeight={rowIdx === 0 ? "bold" : "normal"}
                                  numberOfLines={1}
                                  fontSize={13}
                                >
                                  {cell || "—"}
                                </Text>
                              ))}
                            </XStack>
                          ))}
                        </YStack>
                      </ScrollView>
                    </YStack>
                  </GlassyCard>
                );
              })()}

              {/* Column Mapping Fields */}
              <GlassyCard>
                <YStack padding="$4" gap="$4">
                  {/* Category Column */}
                  <YStack gap="$2">
                    <Label color="$secondaryText" fontSize={12}>
                      Category Column
                    </Label>
                    <XStack gap="$2" flexWrap="wrap">
                      {["A", "B", "C", "D", "E"].map((col) => (
                        <Pressable
                          key={col}
                          onPress={() =>
                            setMappingOverrides({ ...mappingOverrides, categoryColumn: col })
                          }
                        >
                          <YStack
                            backgroundColor={
                              mappingOverrides.categoryColumn === col
                                ? "#22c55e"
                                : "$backgroundHover"
                            }
                            paddingHorizontal="$4"
                            paddingVertical="$2"
                            borderRadius="$3"
                            minWidth={48}
                            alignItems="center"
                          >
                            <Text
                              color={mappingOverrides.categoryColumn === col ? "white" : "$color"}
                              fontWeight="600"
                            >
                              {col}
                            </Text>
                          </YStack>
                        </Pressable>
                      ))}
                    </XStack>
                  </YStack>

                  {/* Value Column */}
                  <YStack gap="$2">
                    <Label color="$secondaryText" fontSize={12}>
                      Value Column
                    </Label>
                    <XStack gap="$2" flexWrap="wrap">
                      {["A", "B", "C", "D", "E", "F"].map((col) => (
                        <Pressable
                          key={col}
                          onPress={() =>
                            setMappingOverrides({ ...mappingOverrides, valueColumn: col })
                          }
                        >
                          <YStack
                            backgroundColor={
                              mappingOverrides.valueColumn === col ? "#22c55e" : "$backgroundHover"
                            }
                            paddingHorizontal="$4"
                            paddingVertical="$2"
                            borderRadius="$3"
                            minWidth={48}
                            alignItems="center"
                          >
                            <Text
                              color={mappingOverrides.valueColumn === col ? "white" : "$color"}
                              fontWeight="600"
                            >
                              {col}
                            </Text>
                          </YStack>
                        </Pressable>
                      ))}
                    </XStack>
                  </YStack>

                  {/* Header Row */}
                  <YStack gap="$2">
                    <Label color="$secondaryText" fontSize={12}>
                      Data Starts at Row
                    </Label>
                    <XStack gap="$2" flexWrap="wrap">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                        <Pressable
                          key={row}
                          onPress={() =>
                            setMappingOverrides({ ...mappingOverrides, headerRow: row })
                          }
                        >
                          <YStack
                            backgroundColor={
                              mappingOverrides.headerRow === row ? "#22c55e" : "$backgroundHover"
                            }
                            paddingHorizontal="$3"
                            paddingVertical="$2"
                            borderRadius="$3"
                            minWidth={40}
                            alignItems="center"
                          >
                            <Text
                              color={mappingOverrides.headerRow === row ? "white" : "$color"}
                              fontWeight="600"
                            >
                              {row}
                            </Text>
                          </YStack>
                        </Pressable>
                      ))}
                    </XStack>
                  </YStack>

                  {/* Cell Coordinate (Optional - for Planning Sheets) */}
                  <YStack gap="$2">
                    <Label color="$secondaryText" fontSize={12}>
                      Start Cell (Optional)
                    </Label>
                    <XStack gap="$2" alignItems="center">
                      <Input
                        flex={1}
                        placeholder="e.g., B10"
                        value={mappingOverrides.startCell ?? ""}
                        onChangeText={(text) =>
                          setMappingOverrides({
                            ...mappingOverrides,
                            startCell: text.toUpperCase(),
                          })
                        }
                        maxLength={6}
                        autoCapitalize="characters"
                        backgroundColor="$backgroundHover"
                        borderWidth={0}
                        color="$color"
                      />
                      <Text color="$secondaryText" fontSize={12} maxWidth={180}>
                        For budget cells like B10, C5
                      </Text>
                    </XStack>
                  </YStack>
                </YStack>
              </GlassyCard>

              {/* Preview Info */}
              <YStack backgroundColor="$backgroundHover" padding="$3" borderRadius="$3" gap="$1">
                <Text color="$color" fontWeight="600" fontSize={14}>
                  📊 What will be imported:
                </Text>
                <Text color="$secondaryText" fontSize={13}>
                  • Categories from column {mappingOverrides.categoryColumn}
                </Text>
                <Text color="$secondaryText" fontSize={13}>
                  • Values from column {mappingOverrides.valueColumn}
                </Text>
                <Text color="$secondaryText" fontSize={13}>
                  • Starting from row {mappingOverrides.headerRow}
                </Text>
                {mappingOverrides.startCell && (
                  <Text color="$secondaryText" fontSize={13}>
                    • Cell coordinate: {mappingOverrides.startCell}
                  </Text>
                )}
              </YStack>
            </ScrollView>

            <XStack gap="$3">
              <Button
                flex={1}
                backgroundColor="$backgroundHover"
                color="$color"
                onPress={() => {
                  setMode("select-sheet");
                  setMappingOverrides(null);
                }}
              >
                Back
              </Button>
              <Button
                flex={2}
                backgroundColor="#22c55e"
                color="white"
                onPress={handleSheetImport}
                disabled={importFromExcel.isPending}
              >
                {importFromExcel.isPending ? "Importing..." : "Import Plan"}
              </Button>
            </XStack>
          </YStack>
        )}

        {/* Review Suggestions Mode */}
        {mode === "review-suggestions" && (
          <YStack gap="$4">
            <Text color="$color" fontSize={22} fontWeight="bold" fontFamily="$heading">
              🎯 Review Suggestions
            </Text>
            <Text color="$secondaryText" fontSize={14}>
              Echo found these items in your Excel. Confirm to add them to your plan:
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              <YStack gap="$3">
                {detectedSuggestions.map((suggestion) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={(s) => {
                      // Remove from suggestions list
                      setDetectedSuggestions((prev) => prev.filter((item) => item.id !== s.id));
                      // TODO: Open pre-filled edit sheet based on type
                      Alert.alert(
                        "Item Added",
                        `Added "${s.suggestedName}" as ${s.type}. You can edit it later in the Planning tab.`,
                      );
                    }}
                    onDismiss={(s) => {
                      setDetectedSuggestions((prev) => prev.filter((item) => item.id !== s.id));
                    }}
                  />
                ))}

                {detectedSuggestions.length === 0 && (
                  <GlassyCard>
                    <YStack padding="$4" alignItems="center" gap="$2">
                      <Text fontSize={32}>✅</Text>
                      <Text color="$color" fontWeight="600">
                        All suggestions reviewed!
                      </Text>
                      <Text color="$secondaryText" fontSize={14} textAlign="center">
                        You can close this sheet and start using your plan.
                      </Text>
                    </YStack>
                  </GlassyCard>
                )}
              </YStack>
            </ScrollView>

            <XStack gap="$3" marginTop="$2">
              <Button
                flex={1}
                backgroundColor="$backgroundHover"
                color="$color"
                onPress={() => setMode("confirm-mapping")}
              >
                Back
              </Button>
              <Button flex={2} backgroundColor="#22c55e" color="white" onPress={handleClose}>
                Done
              </Button>
            </XStack>
          </YStack>
        )}
      </Sheet.Frame>
    </Sheet>
  );
}
