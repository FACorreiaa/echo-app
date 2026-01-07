/**
 * BudgetCategoryPacing - Shows spent vs budgeted for a category
 * Displays: "€320 Spent / €500 Budgeted" with progress bar
 */

import { MotiView } from "moti";
import React from "react";
import { StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";

export interface BudgetCategoryPacingProps {
  /** Category name */
  category: string;
  /** Amount spent (in minor units, e.g., cents) */
  spentMinor: number;
  /** Budget amount (in minor units) */
  budgetMinor: number;
  /** Currency code */
  currencyCode?: string;
  /** Category emoji/icon */
  emoji?: string;
  /** Compact mode for grid display */
  compact?: boolean;
}

// Format currency for display
const formatCurrency = (amountMinor: number, code = "EUR") =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);

export function BudgetCategoryPacing({
  category,
  spentMinor,
  budgetMinor,
  currencyCode = "EUR",
  emoji = "💳",
  compact = false,
}: BudgetCategoryPacingProps) {
  // Calculate percentage
  const percent = budgetMinor > 0 ? (spentMinor / budgetMinor) * 100 : 0;
  const isOverBudget = percent > 100;
  const isNearLimit = percent >= 80 && percent <= 100;

  // Colors
  const getBarColor = () => {
    if (isOverBudget) return "#ef4444"; // Red
    if (isNearLimit) return "#f59e0b"; // Amber
    return "#22c55e"; // Green
  };
  const barColor = getBarColor();

  // Remaining amount
  const remainingMinor = budgetMinor - spentMinor;

  if (compact) {
    return (
      <YStack padding="$3" gap="$2">
        <XStack alignItems="center" gap="$2">
          <Text fontSize={16}>{emoji}</Text>
          <Text color="$color" fontSize={13} fontWeight="600" flex={1} numberOfLines={1}>
            {category}
          </Text>
        </XStack>

        {/* Progress Bar */}
        <YStack height={8} backgroundColor="$backgroundHover" borderRadius="$2" overflow="hidden">
          <MotiView
            from={{ width: "0%" }}
            animate={{ width: `${Math.min(percent, 100)}%` }}
            transition={{ type: "timing", duration: 600 }}
            style={[styles.progressBar, { backgroundColor: barColor }]}
          />
        </YStack>

        {/* Amount */}
        <XStack justifyContent="space-between">
          <Text color={barColor} fontSize={14} fontWeight="bold">
            {formatCurrency(spentMinor, currencyCode)}
          </Text>
          <Text color="$secondaryText" fontSize={12}>
            / {formatCurrency(budgetMinor, currencyCode)}
          </Text>
        </XStack>
      </YStack>
    );
  }

  return (
    <GlassyCard>
      <YStack padding="$4" gap="$3">
        {/* Header */}
        <XStack alignItems="center" gap="$3">
          <YStack
            backgroundColor="$backgroundHover"
            width={40}
            height={40}
            borderRadius={20}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={20}>{emoji}</Text>
          </YStack>
          <YStack flex={1}>
            <Text color="$color" fontSize={16} fontWeight="600">
              {category}
            </Text>
            <Text color="$secondaryText" fontSize={12}>
              {isOverBudget
                ? "Over budget"
                : `${formatCurrency(remainingMinor, currencyCode)} left`}
            </Text>
          </YStack>
          <Text color={barColor} fontSize={18} fontWeight="bold">
            {percent.toFixed(0)}%
          </Text>
        </XStack>

        {/* Progress Bar */}
        <YStack height={12} backgroundColor="$backgroundHover" borderRadius="$3" overflow="hidden">
          <MotiView
            from={{ width: "0%" }}
            animate={{ width: `${Math.min(percent, 100)}%` }}
            transition={{ type: "timing", duration: 800 }}
            style={[styles.progressBar, { backgroundColor: barColor }]}
          />
        </YStack>

        {/* Amounts */}
        <XStack justifyContent="space-between" alignItems="center">
          <YStack>
            <Text color="$color" fontSize={20} fontWeight="bold">
              {formatCurrency(spentMinor, currencyCode)}
            </Text>
            <Text color="$secondaryText" fontSize={11}>
              spent
            </Text>
          </YStack>
          <Text color="$secondaryText" fontSize={14}>
            of {formatCurrency(budgetMinor, currencyCode)}
          </Text>
        </XStack>
      </YStack>
    </GlassyCard>
  );
}

const styles = StyleSheet.create({
  progressBar: {
    height: "100%",
    borderRadius: 8,
  },
});
