/**
 * IncomeSpendingChart.tsx
 * Horizontal stacked bar comparing Income vs (Expenses + Savings)
 */
import { GlassWidget } from "@/components/GlassWidget";
import React from "react";
import { View } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface ChartProps {
  incomeTotal: number;
  expenseTotal: number;
  savingsTotal: number;
  currencyCode?: string;
}

export function IncomeSpendingChart({
  incomeTotal,
  expenseTotal,
  savingsTotal,
  currencyCode = "EUR",
}: ChartProps) {
  const totalFlow = Math.max(incomeTotal, expenseTotal + savingsTotal);

  // Calculate percentages for display (clamped 0-100 for safety)
  const expensePct = totalFlow > 0 ? Math.round((expenseTotal / totalFlow) * 100) : 0;
  const savingsPct = totalFlow > 0 ? Math.round((savingsTotal / totalFlow) * 100) : 0;

  const widthPct = (val: number) => `${Math.min((val / totalFlow) * 100, 100)}%`;

  const format = (v: number) =>
    new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(v / 100);

  return (
    <GlassWidget padding="$4">
      <YStack gap="$4">
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$color" fontSize={16} fontWeight="600">
            Income vs. Outflow
          </Text>
        </XStack>

        <YStack gap="$2">
          {/* Income Bar */}
          <YStack>
            <XStack justifyContent="space-between" marginBottom="$1">
              <Text color="$secondaryText" fontSize={12}>
                Total Income
              </Text>
              <Text color="$color" fontSize={12}>
                {format(incomeTotal)}
              </Text>
            </XStack>
            <View
              style={{
                height: 12,
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 6,
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: widthPct(incomeTotal) as any,
                  backgroundColor: "#14b8a6",
                  borderRadius: 6,
                }}
              />
            </View>
          </YStack>

          {/* Outflow Bar (Stacked: Expense + Savings) */}
          <YStack>
            <XStack justifyContent="space-between" marginBottom="$1">
              <Text color="$secondaryText" fontSize={12}>
                Outflows
              </Text>
              <Text color="$color" fontSize={12}>
                {format(expenseTotal + savingsTotal)}
              </Text>
            </XStack>
            <View
              style={{
                height: 12,
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.05)",
                borderRadius: 6,
                flexDirection: "row",
                overflow: "hidden",
              }}
            >
              {/* Expenses */}
              <View
                style={{
                  height: "100%",
                  width: widthPct(expenseTotal) as any,
                  backgroundColor: "#ef4444",
                }}
              />
              {/* Savings */}
              <View
                style={{
                  height: "100%",
                  width: widthPct(savingsTotal) as any,
                  backgroundColor: "#6366f1",
                }}
              />
            </View>
            <XStack gap="$3" marginTop="$1">
              <XStack alignItems="center" gap="$1">
                <View
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }}
                />
                <Text color="$secondaryText" fontSize={10}>
                  Expenses ({expensePct}%)
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$1">
                <View
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#6366f1" }}
                />
                <Text color="$secondaryText" fontSize={10}>
                  Future You ({savingsPct}%)
                </Text>
              </XStack>
            </XStack>
          </YStack>
        </YStack>
      </YStack>
    </GlassWidget>
  );
}
