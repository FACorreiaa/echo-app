import { Check, ChevronDown } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { ScrollView as RNScrollView } from "react-native";
import {
  Adapt,
  Button,
  Checkbox,
  H4,
  Label,
  Select,
  Separator,
  Sheet,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { GlassyButton } from "@/components/ui/GlassyButton";
import { GlassyCard } from "@/components/ui/GlassyCard";
import type { ColumnMapping, FileAnalysis } from "@/lib/hooks/use-import";

interface MappingWizardProps {
  analysis: FileAnalysis;
  onComplete: (mapping: ColumnMapping) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MappingWizard = ({
  analysis,
  onComplete,
  onCancel,
  isLoading = false,
}: MappingWizardProps) => {
  // Initialize with suggestions
  const [dateCol, setDateCol] = useState<string>(
    analysis.suggestions.dateCol >= 0 ? String(analysis.suggestions.dateCol) : "",
  );
  const [descCol, setDescCol] = useState<string>(
    analysis.suggestions.descCol >= 0 ? String(analysis.suggestions.descCol) : "",
  );
  const [categoryCol, setCategoryCol] = useState<string>(
    analysis.suggestions.categoryCol >= 0 ? String(analysis.suggestions.categoryCol) : "",
  );
  const [isDoubleEntry, setIsDoubleEntry] = useState(analysis.suggestions.isDoubleEntry);
  const [amountCol, setAmountCol] = useState<string>(
    analysis.suggestions.amountCol >= 0 ? String(analysis.suggestions.amountCol) : "",
  );
  const [debitCol, setDebitCol] = useState<string>(
    analysis.suggestions.debitCol >= 0 ? String(analysis.suggestions.debitCol) : "",
  );
  const [creditCol, setCreditCol] = useState<string>(
    analysis.suggestions.creditCol >= 0 ? String(analysis.suggestions.creditCol) : "",
  );
  const [isEuropeanFormat, setIsEuropeanFormat] = useState(
    analysis.probedDialect?.isEuropeanFormat ?? true,
  );
  const [dateFormat, setDateFormat] = useState(analysis.probedDialect?.dateFormat ?? "DD-MM-YYYY");
  // Show contextual confirmation only if confidence is low
  const showDialectConfirm = (analysis.probedDialect?.confidence ?? 1) < 0.7;

  const handleSubmit = () => {
    const mapping: ColumnMapping = {
      dateCol: parseInt(dateCol, 10),
      descCol: parseInt(descCol, 10),
      categoryCol: categoryCol ? parseInt(categoryCol, 10) : undefined,
      isDoubleEntry,
      isEuropeanFormat,
      dateFormat,
    };

    if (isDoubleEntry) {
      mapping.debitCol = parseInt(debitCol, 10);
      mapping.creditCol = parseInt(creditCol, 10);
    } else {
      mapping.amountCol = parseInt(amountCol, 10);
    }

    onComplete(mapping);
  };

  const isValid =
    dateCol !== "" &&
    descCol !== "" &&
    (isDoubleEntry ? debitCol !== "" && creditCol !== "" : amountCol !== "");

  return (
    <YStack p="$4" gap="$5" flex={1}>
      {/* Header */}
      <YStack gap="$2">
        <H4 color="$color">Map Your Bank File</H4>
        <Text color="$secondaryText" fontSize={14}>
          Help Echo understand your file format. This will be saved for future imports.
        </Text>
      </YStack>

      {/* CSV Preview */}
      <YStack gap="$2">
        <Text fontSize={12} fontWeight="bold" color="$secondaryText" textTransform="uppercase">
          File Preview
        </Text>
        <GlassyCard>
          <RNScrollView horizontal showsHorizontalScrollIndicator>
            <YStack>
              {/* Header Row */}
              <XStack bg="$listItemBackground" p="$3" gap="$4">
                {analysis.headers.map((header, i) => (
                  <Text
                    key={i}
                    width={120}
                    fontWeight="bold"
                    color="$color"
                    numberOfLines={1}
                    fontSize={13}
                  >
                    {header}
                  </Text>
                ))}
              </XStack>
              {/* Data Rows */}
              {analysis.sampleRows.map((row, rowIdx) => (
                <XStack key={rowIdx} p="$3" gap="$4" borderTopWidth={1} borderColor="$borderColor">
                  {row.map((cell, cellIdx) => (
                    <Text
                      key={cellIdx}
                      width={120}
                      color="$secondaryText"
                      numberOfLines={1}
                      fontSize={13}
                    >
                      {cell || "—"}
                    </Text>
                  ))}
                </XStack>
              ))}
            </YStack>
          </RNScrollView>
        </GlassyCard>
      </YStack>

      {/* Column Mappings */}
      <YStack gap="$4">
        <Text fontSize={12} fontWeight="bold" color="$secondaryText" textTransform="uppercase">
          Column Mapping
        </Text>

        <XStack gap="$4" flexWrap="wrap">
          <MappingSelector
            label="Date Column"
            value={dateCol}
            onValueChange={setDateCol}
            options={analysis.headers}
            required
          />
          <MappingSelector
            label="Description"
            value={descCol}
            onValueChange={setDescCol}
            options={analysis.headers}
            required
          />
        </XStack>

        {/* Double Entry Toggle */}
        <XStack alignItems="center" gap="$3">
          <Checkbox
            size="$4"
            checked={isDoubleEntry}
            onCheckedChange={(checked) => setIsDoubleEntry(checked === true)}
          >
            <Checkbox.Indicator>
              <Check size={16} />
            </Checkbox.Indicator>
          </Checkbox>
          <Label fontSize={14} color="$color">
            My bank uses separate Debit/Credit columns
          </Label>
        </XStack>

        {/* Amount Columns */}
        {isDoubleEntry ? (
          <XStack gap="$4" flexWrap="wrap">
            <MappingSelector
              label="Debit Column"
              value={debitCol}
              onValueChange={setDebitCol}
              options={analysis.headers}
              required
            />
            <MappingSelector
              label="Credit Column"
              value={creditCol}
              onValueChange={setCreditCol}
              options={analysis.headers}
              required
            />
          </XStack>
        ) : (
          <MappingSelector
            label="Amount Column"
            value={amountCol}
            onValueChange={setAmountCol}
            options={analysis.headers}
            required
          />
        )}

        <MappingSelector
          label="Category (Optional)"
          value={categoryCol}
          onValueChange={setCategoryCol}
          options={analysis.headers}
        />

        <Separator my="$2" />

        {/* Regional Settings - Auto-detected with optional confirmation */}
        <Text fontSize={12} fontWeight="bold" color="$secondaryText" textTransform="uppercase">
          Regional Settings
        </Text>

        {showDialectConfirm ? (
          /* Contextual confirmation when confidence is low */
          <GlassyCard>
            <YStack gap="$3" p="$3">
              <Text fontWeight="bold" color="$color" fontSize={14}>
                Quick Check
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                Is "1.234,56" displayed as €1,234.56 in your bank statement?
              </Text>
              <XStack gap="$3">
                <Button
                  flex={1}
                  size="$3"
                  backgroundColor={isEuropeanFormat ? "$accentColor" : "$background"}
                  onPress={() => setIsEuropeanFormat(true)}
                >
                  <Text color={isEuropeanFormat ? "white" : "$color"}>Yes (European)</Text>
                </Button>
                <Button
                  flex={1}
                  size="$3"
                  backgroundColor={!isEuropeanFormat ? "$accentColor" : "$background"}
                  onPress={() => setIsEuropeanFormat(false)}
                >
                  <Text color={!isEuropeanFormat ? "white" : "$color"}>No (US)</Text>
                </Button>
              </XStack>
            </YStack>
          </GlassyCard>
        ) : (
          /* Auto-detected - just show the detected format */
          <XStack alignItems="center" gap="$3">
            <Checkbox
              size="$4"
              checked={isEuropeanFormat}
              onCheckedChange={(checked) => setIsEuropeanFormat(checked === true)}
            >
              <Checkbox.Indicator>
                <Check size={16} />
              </Checkbox.Indicator>
            </Checkbox>
            <YStack>
              <Label fontSize={14} color="$color">
                European number format
              </Label>
              <Text fontSize={12} color="$secondaryText">
                Uses comma as decimal (e.g., 1.234,56)
              </Text>
            </YStack>
          </XStack>
        )}

        <MappingSelector
          label="Date Format"
          value={dateFormat}
          onValueChange={setDateFormat}
          options={["DD-MM-YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
          isRawOptions
        />
      </YStack>

      {/* Actions */}
      <XStack gap="$3" mt="$4">
        <Button flex={1} onPress={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <YStack flex={1}>
          <GlassyButton onPress={handleSubmit} disabled={!isValid || isLoading}>
            {isLoading ? "Importing..." : "Save & Import"}
          </GlassyButton>
        </YStack>
      </XStack>
    </YStack>
  );
};

/* Column selector component */
interface MappingSelectorProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: string[];
  required?: boolean;
  isRawOptions?: boolean;
}

const MappingSelector = ({
  label,
  value,
  onValueChange,
  options,
  required,
  isRawOptions,
}: MappingSelectorProps) => {
  return (
    <YStack gap="$1" flex={1} minWidth={140}>
      <Label fontSize={12} color="$secondaryText" marginLeft={4}>
        {label} {required && <Text color="#ef4444">*</Text>}
      </Label>
      <Select value={value} onValueChange={onValueChange} disablePreventBodyScroll>
        <Select.Trigger
          iconAfter={ChevronDown}
          background="$background"
          borderColor="$borderColor"
          borderRadius="$4"
        >
          <Select.Value placeholder={`Select ${label.toLowerCase()}...`} />
        </Select.Trigger>

        <Adapt when={"sm" as const} platform="touch">
          <Sheet modal dismissOnSnapToBottom snapPointsMode="fit">
            <Sheet.Frame>
              <Sheet.ScrollView>
                <Adapt.Contents />
              </Sheet.ScrollView>
            </Sheet.Frame>
            <Sheet.Overlay />
          </Sheet>
        </Adapt>

        <Select.Content zIndex={200000}>
          <Select.Viewport>
            <Select.Group>
              <Select.Label>{label}</Select.Label>
              {options.map((opt, i) => (
                <Select.Item key={i} index={i} value={isRawOptions ? opt : String(i)}>
                  <Select.ItemText>{opt}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={16} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Group>
          </Select.Viewport>
        </Select.Content>
      </Select>
    </YStack>
  );
};

export default MappingWizard;
