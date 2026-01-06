/**
 * CategorySpendingChart - Horizontal bar chart showing spending by category
 * Uses Victory Native v41+ (Skia-based) for high-performance animated charts
 */

import React, { useState } from "react";
import { Dimensions, View } from "react-native";
import { Text, XStack, YStack } from "tamagui";
import { Bar, CartesianChart } from "victory-native";

// Types
export interface CategorySpendingData {
  id: string;
  name: string;
  budgetedMinor: number;
  actualMinor?: number;
  color: string;
}

interface CategorySpendingChartProps {
  data: CategorySpendingData[];
  currencyCode?: string;
  onCategoryPress?: (category: CategorySpendingData) => void;
  showActual?: boolean;
}

// Color palette for categories
const CATEGORY_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
  "#6366f1", // indigo
];

// Format currency for display
function formatCurrency(amountMinor: number, currencyCode = "EUR"): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CategorySpendingChart({
  data,
  currencyCode = "EUR",
  onCategoryPress,
  showActual = false,
}: CategorySpendingChartProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 32;
  const chartHeight = Math.max(250, data.length * 45);

  // Transform data for Victory Native v41
  const chartData = data.map((item, index) => ({
    x: index,
    y: item.budgetedMinor / 100,
    label: item.name,
    color: item.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    id: item.id,
    originalData: item,
  }));

  // Calculate totals
  const totalBudgeted = data.reduce((sum, item) => sum + item.budgetedMinor, 0);

  const handlePress = (category: CategorySpendingData) => {
    setSelectedId(category.id === selectedId ? null : category.id);
    onCategoryPress?.(category);
  };

  if (data.length === 0) {
    return (
      <YStack padding="$4" alignItems="center" justifyContent="center">
        <Text color="$secondaryText">No spending data available</Text>
      </YStack>
    );
  }

  return (
    <YStack gap="$2" padding="$3">
      {/* Chart Title */}
      <XStack justifyContent="space-between" alignItems="center">
        <Text color="$color" fontWeight="600" fontSize={16}>
          Para onde vai o meu dinheiro?
        </Text>
        <Text color="$secondaryText" fontSize={12}>
          {formatCurrency(totalBudgeted, currencyCode)} total
        </Text>
      </XStack>

      {/* Victory Native Chart */}
      <View style={{ height: chartHeight, width: chartWidth }}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["y"]}
          domainPadding={{ left: 20, right: 20, top: 20, bottom: 20 }}
          axisOptions={{
            font: null,
            tickCount: { x: data.length, y: 5 },
            formatXLabel: (val) => chartData[val]?.label || "",
            formatYLabel: (val) => `${Math.round(val / 1000)}k`,
            lineColor: "#374151",
            labelColor: "#9ca3af",
          }}
        >
          {({ points, chartBounds }) => (
            <>
              {points.y.map((point, index) => {
                const item = chartData[index];
                const barWidth = ((chartBounds.right - chartBounds.left) / data.length) * 0.7;
                const isSelected = item?.id === selectedId;

                return (
                  <Bar
                    key={item?.id || index}
                    points={[point]}
                    chartBounds={chartBounds}
                    animate={{ type: "spring" }}
                    roundedCorners={{ topLeft: 4, topRight: 4 }}
                    barWidth={barWidth}
                    color={item?.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    opacity={isSelected ? 1 : 0.85}
                  />
                );
              })}
            </>
          )}
        </CartesianChart>
      </View>

      {/* Category Legend with tap interaction */}
      <YStack gap="$1" marginTop="$2">
        {data.map((category, index) => {
          const isSelected = category.id === selectedId;
          const percentage = ((category.budgetedMinor / totalBudgeted) * 100).toFixed(1);

          return (
            <XStack
              key={category.id}
              onPress={() => handlePress(category)}
              padding="$2"
              borderRadius="$2"
              backgroundColor={isSelected ? "$backgroundHover" : "transparent"}
              alignItems="center"
              gap="$2"
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor:
                    category.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                }}
              />
              <Text color="$color" fontSize={13} flex={1} numberOfLines={1}>
                {category.name}
              </Text>
              <Text color="$secondaryText" fontSize={12}>
                {percentage}%
              </Text>
              <Text color="$color" fontSize={13} fontWeight="500">
                {formatCurrency(category.budgetedMinor, currencyCode)}
              </Text>
            </XStack>
          );
        })}
      </YStack>

      {/* Selected Category Detail */}
      {selectedId && (
        <YStack backgroundColor="$backgroundHover" padding="$3" borderRadius="$3" marginTop="$2">
          {(() => {
            const selected = data.find((d) => d.id === selectedId);
            if (!selected) return null;
            const percentage = ((selected.budgetedMinor / totalBudgeted) * 100).toFixed(1);
            return (
              <>
                <XStack justifyContent="space-between" alignItems="center">
                  <Text color="$color" fontWeight="600">
                    {selected.name}
                  </Text>
                  <Text color="$accentColor" fontWeight="600">
                    {percentage}%
                  </Text>
                </XStack>
                <XStack justifyContent="space-between" marginTop="$2">
                  <Text color="$secondaryText" fontSize={13}>
                    Orçado: {formatCurrency(selected.budgetedMinor, currencyCode)}
                  </Text>
                  {showActual && selected.actualMinor !== undefined && (
                    <Text
                      color={
                        selected.actualMinor > selected.budgetedMinor
                          ? ("#ef4444" as any)
                          : ("#22c55e" as any)
                      }
                      fontSize={13}
                    >
                      Real: {formatCurrency(selected.actualMinor, currencyCode)}
                    </Text>
                  )}
                </XStack>
              </>
            );
          })()}
        </YStack>
      )}
    </YStack>
  );
}

export { CATEGORY_COLORS };
