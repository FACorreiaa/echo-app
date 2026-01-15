/**
 * PlanProgressWidget - Displays actual vs budgeted tracking for a plan
 *
 * Shows:
 * 1. Overall budget usage (total spent / total budgeted)
 * 2. Category-level progress with segmented bars
 * 3. Remaining budget indicator
 */

import { TrendingDown, TrendingUp, Wallet } from "@tamagui/lucide-icons";
import React from "react";
import { Progress, Text, XStack, YStack } from "tamagui";

import { GlassWidget } from "@/components/GlassWidget";
import type { PlanCategoryGroup } from "@/lib/hooks/use-plans";

interface PlanProgressWidgetProps {
  categoryGroups: PlanCategoryGroup[];
  currencyCode?: string;
}

interface GroupProgress {
  id: string;
  name: string;
  color: string;
  budgetedMinor: number;
  actualMinor: number;
  percentage: number;
}

// Format currency for display
function formatCurrency(amountMinor: number, currencyCode = "EUR"): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Default colors for groups
const GROUP_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

export function PlanProgressWidget({
  categoryGroups,
  currencyCode = "EUR",
}: PlanProgressWidgetProps) {
  // Calculate totals and per-group progress
  const groupProgress: GroupProgress[] = React.useMemo(() => {
    return categoryGroups
      .map((group, index) => {
        let budgetedMinor = 0;
        let actualMinor = 0;

        group.categories.forEach((cat) => {
          cat.items.forEach((item) => {
            // Exclude income items from spending progress
            if (item.itemType === "income") return;

            budgetedMinor += (item.budgeted ?? 0) * 100;
            actualMinor += (item.actual ?? 0) * 100;
          });
        });

        const percentage = budgetedMinor > 0 ? (actualMinor / budgetedMinor) * 100 : 0;

        return {
          id: group.id,
          name: group.name,
          color: group.color ?? GROUP_COLORS[index % GROUP_COLORS.length],
          budgetedMinor,
          actualMinor,
          percentage: Math.min(percentage, 100), // Cap at 100% for display
        };
      })
      .filter((g) => g.budgetedMinor > 0); // Hide groups with no budget
  }, [categoryGroups]);

  // Overall totals
  const totalBudgeted = groupProgress.reduce((sum, g) => sum + g.budgetedMinor, 0);
  const totalActual = groupProgress.reduce((sum, g) => sum + g.actualMinor, 0);
  const totalRemaining = totalBudgeted - totalActual;
  const overallPercentage = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;
  const isOverBudget = totalActual > totalBudgeted;

  if (groupProgress.length === 0) {
    return null; // Don't render if no budget data
  }

  return (
    <GlassWidget>
      <YStack gap="$4">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$2" alignItems="center">
            <Wallet size={18} color="$accentColor" />
            <Text color="$color" fontWeight="700" fontSize={16}>
              Budget Progress
            </Text>
          </XStack>
          <XStack
            backgroundColor={isOverBudget ? "$red2" : "$green2"}
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$3"
            gap="$1"
            alignItems="center"
          >
            {isOverBudget ? (
              <TrendingUp size={12} color="$red10" />
            ) : (
              <TrendingDown size={12} color="$green10" />
            )}
            <Text fontSize={11} fontWeight="600" color={isOverBudget ? "$red11" : "$green11"}>
              {overallPercentage.toFixed(0)}% used
            </Text>
          </XStack>
        </XStack>

        {/* Overall Summary */}
        <YStack gap="$2">
          <XStack justifyContent="space-between">
            <YStack>
              <Text color="$secondaryText" fontSize={11}>
                Spent
              </Text>
              <Text color="$color" fontWeight="700" fontSize={18}>
                {formatCurrency(totalActual, currencyCode)}
              </Text>
            </YStack>
            <YStack alignItems="flex-end">
              <Text color="$secondaryText" fontSize={11}>
                {isOverBudget ? "Over Budget" : "Remaining"}
              </Text>
              <Text color={isOverBudget ? "$red10" : "$green10"} fontWeight="700" fontSize={18}>
                {formatCurrency(Math.abs(totalRemaining), currencyCode)}
              </Text>
            </YStack>
          </XStack>

          {/* Overall Progress Bar */}
          <Progress
            value={Math.min(overallPercentage, 100)}
            size="$2"
            backgroundColor="$backgroundHover"
          >
            <Progress.Indicator
              animation="bouncy"
              backgroundColor={isOverBudget ? "$red10" : "$accentColor"}
            />
          </Progress>
          <Text color="$secondaryText" fontSize={11} textAlign="right">
            of {formatCurrency(totalBudgeted, currencyCode)} budgeted
          </Text>
        </YStack>

        {/* Category Breakdown */}
        <YStack gap="$3">
          <Text color="$secondaryText" fontSize={12} fontWeight="600">
            BY CATEGORY
          </Text>
          {groupProgress.map((group) => (
            <YStack key={group.id} gap="$1">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack gap="$2" alignItems="center">
                  <YStack
                    width={8}
                    height={8}
                    borderRadius={4}
                    backgroundColor={group.color as any}
                  />
                  <Text color="$color" fontSize={13} fontWeight="500">
                    {group.name}
                  </Text>
                </XStack>
                <Text color="$secondaryText" fontSize={12}>
                  {formatCurrency(group.actualMinor, currencyCode)} /{" "}
                  {formatCurrency(group.budgetedMinor, currencyCode)}
                </Text>
              </XStack>
              <Progress value={group.percentage} size="$1" backgroundColor="$backgroundHover">
                <Progress.Indicator animation="bouncy" backgroundColor={group.color as any} />
              </Progress>
            </YStack>
          ))}
        </YStack>
      </YStack>
    </GlassWidget>
  );
}
