/**
 * MonthlyGridView - Spreadsheet-like view with monthly columns
 * Features:
 * - Horizontal scrolling table
 * - Sticky first column for category names
 * - Dynamic month columns based on plan period
 * - Color-coded cells based on thresholds
 */

import React, { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

import { GridCell, type GridCellData, type ThresholdStatus } from "./GridCell";

// Types
export interface MonthlyValue {
  month: string; // e.g., "jan-26"
  value: number;
  percentage?: number;
  isFormula?: boolean;
  formula?: string;
}

export interface MonthlyRowData {
  id: string;
  name: string;
  isCategory?: boolean; // True for category rows (bold)
  isTotal?: boolean; // True for total rows
  monthlyValues: MonthlyValue[];
  targetPercentage?: number;
}

interface MonthlyGridViewProps {
  rows: MonthlyRowData[];
  months: string[]; // ["jan-26", "feb-26", ...]
  currencyCode?: string;
  onValueChange?: (rowId: string, month: string, value: number) => void;
  showPercentages?: boolean;
}

// Generate dynamic month columns from start date
export function generateMonths(startDate: Date = new Date(), count: number = 12): string[] {
  const months: string[] = [];
  const current = new Date(startDate);

  for (let i = 0; i < count; i++) {
    const monthName = current.toLocaleDateString("pt-PT", { month: "short" });
    const year = current.getFullYear().toString().slice(-2);
    months.push(`${monthName}-${year}`);
    current.setMonth(current.getMonth() + 1);
  }

  return months;
}

// Calculate threshold status based on actual vs target
function calculateThreshold(actual: number, target?: number): ThresholdStatus {
  if (!target || target === 0) return "normal";

  const ratio = actual / target;
  if (ratio <= 0.6) return "success";
  if (ratio <= 0.9) return "normal";
  if (ratio <= 1.0) return "warning";
  return "danger";
}

// Constants
const CATEGORY_COL_WIDTH = 140;
const VALUE_COL_WIDTH = 80;
const PERCENT_COL_WIDTH = 50;

export function MonthlyGridView({
  rows,
  months,
  currencyCode = "EUR",
  onValueChange,
  showPercentages = true,
}: MonthlyGridViewProps) {
  // Build header row
  const headerCells = useMemo(() => {
    const cells: GridCellData[] = [{ id: "header-cat", value: "Categoria", type: "header" }];

    months.forEach((month) => {
      cells.push({
        id: `header-${month}`,
        value: month.toUpperCase(),
        type: "header",
      });
      if (showPercentages) {
        cells.push({
          id: `header-${month}-pct`,
          value: "%",
          type: "header",
        });
      }
    });

    return cells;
  }, [months, showPercentages]);

  // Build data rows
  const dataRows = useMemo(() => {
    return rows.map((row) => {
      const cells: GridCellData[] = [
        {
          id: `${row.id}-name`,
          value: row.name,
          type: "category",
        },
      ];

      months.forEach((month) => {
        const monthData = row.monthlyValues.find((mv) => mv.month === month);
        const value = monthData?.value ?? 0;
        const percentage = monthData?.percentage ?? 0;

        // Value cell
        cells.push({
          id: `${row.id}-${month}`,
          value,
          type: row.isTotal ? "total" : "value",
          isEditable: !row.isTotal && !monthData?.isFormula,
          isFormula: monthData?.isFormula,
          formula: monthData?.formula,
          thresholdStatus: calculateThreshold(value, row.targetPercentage),
        });

        // Percentage cell
        if (showPercentages) {
          cells.push({
            id: `${row.id}-${month}-pct`,
            value: percentage,
            type: "percentage",
            isEditable: false,
          });
        }
      });

      return { rowId: row.id, cells, isCategory: row.isCategory };
    });
  }, [rows, months, showPercentages]);

  const columnWidths = useMemo(() => {
    const widths = [CATEGORY_COL_WIDTH];
    months.forEach(() => {
      widths.push(VALUE_COL_WIDTH);
      if (showPercentages) {
        widths.push(PERCENT_COL_WIDTH);
      }
    });
    return widths;
  }, [months, showPercentages]);

  const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);

  return (
    <YStack flex={1}>
      {/* Grid Title */}
      <XStack paddingHorizontal="$3" paddingVertical="$2">
        <Text color="$color" fontWeight="600" fontSize={16}>
          Orçamento Mensal
        </Text>
      </XStack>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <YStack width={totalWidth}>
          {/* Header Row */}
          <XStack>
            {headerCells.map((cell, index) => (
              <GridCell
                key={cell.id}
                data={cell}
                width={columnWidths[index]}
                currencyCode={currencyCode}
              />
            ))}
          </XStack>

          {/* Data Rows */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.dataScroll}>
            {dataRows.map(({ rowId, cells, isCategory }) => (
              <XStack key={rowId} backgroundColor={isCategory ? "$backgroundHover" : "transparent"}>
                {cells.map((cell, index) => (
                  <GridCell
                    key={cell.id}
                    data={cell}
                    width={columnWidths[index]}
                    currencyCode={currencyCode}
                    onValueChange={
                      onValueChange
                        ? (id, val) => {
                            const month =
                              months[Math.floor((index - 1) / (showPercentages ? 2 : 1))];
                            onValueChange(rowId, month, val);
                          }
                        : undefined
                    }
                  />
                ))}
              </XStack>
            ))}
          </ScrollView>
        </YStack>
      </ScrollView>

      {/* Sticky Category Column Overlay */}
      <View style={styles.stickyColumn} pointerEvents="none">
        {/* Header */}
        <GridCell
          data={{ id: "sticky-header", value: "Categoria", type: "header" }}
          width={CATEGORY_COL_WIDTH}
        />
        {/* Category Names */}
        {rows.map((row) => (
          <GridCell
            key={`sticky-${row.id}`}
            data={{ id: `sticky-${row.id}`, value: row.name, type: "category" }}
            width={CATEGORY_COL_WIDTH}
          />
        ))}
      </View>
    </YStack>
  );
}

const styles = StyleSheet.create({
  dataScroll: {
    maxHeight: 400,
  },
  stickyColumn: {
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: "#0f172a",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
