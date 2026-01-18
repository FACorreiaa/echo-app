/**
 * CircularBudgetIndicator - Circular Progress Ring for Budget Categories
 *
 * Like Copilot Money's circular budget indicators on mobile view.
 * Shows category budget progress with colored rings and icons.
 *
 * @example
 * <CircularBudgetIndicator
 *   category="groceries"
 *   spent={150}
 *   budgeted={200}
 *   size={80}
 * />
 */

import React from "react";
import { Text, YStack } from "tamagui";
import Svg, { Circle } from "react-native-svg";
import { getCategoryConfig } from "@/lib/constants/categories";
import { MotiView } from "moti";

interface CircularBudgetIndicatorProps {
  category: string;
  spent: number;
  budgeted: number;
  size?: number;
  strokeWidth?: number;
  showAmount?: boolean;
}

export const CircularBudgetIndicator: React.FC<CircularBudgetIndicatorProps> = ({
  category,
  spent,
  budgeted,
  size = 72,
  strokeWidth = 6,
  showAmount = true,
}) => {
  const config = getCategoryConfig(category);
  const percentage = budgeted > 0 ? Math.min((spent / budgeted) * 100, 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  // Determine ring color based on budget health
  const getRingColor = () => {
    if (percentage >= 100) return "#ef4444"; // Over budget
    if (percentage >= 90) return "#f59e0b"; // Warning
    return config.color; // Category color
  };

  const ringColor = getRingColor();
  const center = size / 2;

  return (
    <YStack alignItems="center" gap="$2" width={size + 10}>
      <MotiView
        from={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 600 }}
      >
        <YStack
          position="relative"
          width={size}
          height={size}
          alignItems="center"
          justifyContent="center"
        >
          <Svg width={size} height={size}>
            {/* Background Circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="rgba(100, 116, 139, 0.15)"
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Progress Circle */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={ringColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${center}, ${center}`}
            />
          </Svg>
          {/* Category Icon */}
          <YStack position="absolute" alignItems="center" justifyContent="center">
            <Text fontSize={size * 0.35} lineHeight={size * 0.35}>
              {config.icon}
            </Text>
          </YStack>
        </YStack>
      </MotiView>

      {/* Category Label & Amount */}
      <YStack alignItems="center" gap={2}>
        <Text
          color="$secondaryText"
          fontSize={10}
          fontWeight="700"
          letterSpacing={0.5}
          textAlign="center"
          numberOfLines={1}
        >
          {config.label}
        </Text>
        {showAmount && (
          <Text color={ringColor as any} fontSize={11} fontWeight="700" letterSpacing={0.3}>
            €{spent.toFixed(0)}
          </Text>
        )}
      </YStack>
    </YStack>
  );
};

/**
 * CircularBudgetGrid - Grid of circular budget indicators
 */
interface CircularBudgetGridProps {
  budgets: Array<{
    category: string;
    spent: number;
    budgeted: number;
  }>;
  columns?: number;
  size?: number;
}

export const CircularBudgetGrid: React.FC<CircularBudgetGridProps> = ({
  budgets,
  columns = 4,
  size = 72,
}) => {
  return (
    <YStack gap="$4">
      {budgets
        .reduce(
          (rows, item, index) => {
            const rowIndex = Math.floor(index / columns);
            if (!rows[rowIndex]) rows[rowIndex] = [];
            rows[rowIndex].push(item);
            return rows;
          },
          [] as (typeof budgets)[],
        )
        .map((row, rowIndex) => (
          <YStack key={rowIndex} flexDirection="row" justifyContent="space-around" flexWrap="wrap">
            {row.map((budget) => (
              <CircularBudgetIndicator
                key={budget.category}
                category={budget.category}
                spent={budget.spent}
                budgeted={budget.budgeted}
                size={size}
              />
            ))}
          </YStack>
        ))}
    </YStack>
  );
};
