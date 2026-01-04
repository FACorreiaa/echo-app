/**
 * GridCell - Editable cell for the monthly budget grid
 * Features:
 * - Inline editing with Input
 * - Conditional background colors (green/yellow/red)
 * - Formula indicator
 * - Real-time save on blur
 */

import { Calculator } from "@tamagui/lucide-icons";
import React, { useCallback, useState } from "react";
import { Input, Text, XStack, YStack } from "tamagui";

// Cell types
export type CellType = "header" | "category" | "value" | "percentage" | "total";

// Color thresholds for value cells
export type ThresholdStatus = "normal" | "warning" | "danger" | "success";

export interface GridCellData {
  id: string;
  value: number | string;
  type: CellType;
  isFormula?: boolean;
  formula?: string;
  thresholdStatus?: ThresholdStatus;
  isEditable?: boolean;
}

interface GridCellProps {
  data: GridCellData;
  width: number;
  onValueChange?: (id: string, newValue: number) => void;
  currencyCode?: string;
}

// Get background color based on threshold status
function getBackgroundColor(status?: ThresholdStatus): string {
  switch (status) {
    case "success":
      return "rgba(34, 197, 94, 0.2)"; // green
    case "warning":
      return "rgba(245, 158, 11, 0.2)"; // amber
    case "danger":
      return "rgba(239, 68, 68, 0.2)"; // red
    default:
      return "transparent";
  }
}

// Get text color based on threshold status
function getTextColor(status?: ThresholdStatus): string {
  switch (status) {
    case "success":
      return "#22c55e";
    case "warning":
      return "#f59e0b";
    case "danger":
      return "#ef4444";
    default:
      return "$color";
  }
}

// Format value for display
function formatValue(value: number | string, type: CellType, currencyCode = "EUR"): string {
  if (typeof value === "string") return value;

  switch (type) {
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "value":
    case "total":
      return new Intl.NumberFormat("pt-PT", {
        style: "currency",
        currency: currencyCode,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    default:
      return String(value);
  }
}

export function GridCell({ data, width, onValueChange, currencyCode = "EUR" }: GridCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(data.value));

  const backgroundColor = getBackgroundColor(data.thresholdStatus);
  const textColor = getTextColor(data.thresholdStatus);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (onValueChange && data.isEditable) {
      const numValue = parseFloat(editValue.replace(/[^\d.-]/g, ""));
      if (!isNaN(numValue)) {
        onValueChange(data.id, numValue);
      }
    }
  }, [editValue, data.id, data.isEditable, onValueChange]);

  const handleFocus = useCallback(() => {
    setIsEditing(true);
    setEditValue(typeof data.value === "number" ? String(data.value) : data.value);
  }, [data.value]);

  // Header cell style
  if (data.type === "header") {
    return (
      <YStack
        width={width}
        height={40}
        backgroundColor="$backgroundHover"
        alignItems="center"
        justifyContent="center"
        borderRightWidth={1}
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Text color="$color" fontWeight="600" fontSize={12}>
          {String(data.value)}
        </Text>
      </YStack>
    );
  }

  // Category name cell (left-most column)
  if (data.type === "category") {
    return (
      <YStack
        width={width}
        height={40}
        backgroundColor="$backgroundHover"
        paddingHorizontal="$2"
        justifyContent="center"
        borderRightWidth={1}
        borderBottomWidth={1}
        borderColor="$borderColor"
      >
        <Text color="$color" fontWeight="500" fontSize={12} numberOfLines={1} ellipsizeMode="tail">
          {String(data.value)}
        </Text>
      </YStack>
    );
  }

  // Value/Percentage/Total cell
  return (
    <YStack
      width={width}
      height={40}
      backgroundColor={backgroundColor as any}
      borderRightWidth={1}
      borderBottomWidth={1}
      borderColor="$borderColor"
      justifyContent="center"
      alignItems="center"
    >
      {isEditing && data.isEditable ? (
        <Input
          value={editValue}
          onChangeText={((text: string) => setEditValue(text)) as any}
          onBlur={handleBlur}
          autoFocus
          size="$2"
          textAlign="center"
          backgroundColor="transparent"
          borderWidth={0}
          width="100%"
          height="100%"
        />
      ) : (
        <XStack
          onPress={data.isEditable ? handleFocus : undefined}
          flex={1}
          alignItems="center"
          justifyContent="center"
          width="100%"
        >
          <Text
            color={textColor as "$color"}
            fontSize={12}
            fontWeight={data.type === "total" ? "600" : "400"}
          >
            {formatValue(data.value, data.type, currencyCode)}
          </Text>
          {data.isFormula && (
            <Calculator size={10} color="$secondaryText" style={{ marginLeft: 4 }} />
          )}
        </XStack>
      )}
    </YStack>
  );
}
