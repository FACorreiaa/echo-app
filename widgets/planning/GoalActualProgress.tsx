/**
 * GoalActualProgress - Progress bars showing budget pillars (Fundamentals, Fun, Future You)
 * Features:
 * - Dynamic progress bars with color gradient (green → yellow → red)
 * - Goal vs Actual percentage tracking
 * - Real-time calculation from transactions
 */

import React from "react";
import { Progress, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";

// Types
export interface BudgetPillar {
  id: string;
  name: string; // Dynamic - e.g., "Essentials", "Investing", "Fun"
  goalPercentage: number; // Target % of income
  actualPercentage: number; // Current % spent
  budgetedMinor: number;
  actualMinor: number;
  color: string;
}

interface GoalActualProgressProps {
  pillars: BudgetPillar[];
  totalIncomeMinor: number;
  currencyCode?: string;
}

// Get progress color based on how close to limit
function getProgressColor(actual: number, goal: number): string {
  if (goal === 0) return "#6b7280"; // gray

  const ratio = actual / goal;
  if (ratio <= 0.6) return "#22c55e"; // green - well under budget
  if (ratio <= 0.85) return "#84cc16"; // lime - on track
  if (ratio <= 1.0) return "#f59e0b"; // amber - approaching limit
  return "#ef4444"; // red - over budget
}

// Format currency
function formatCurrency(amountMinor: number, currencyCode = "EUR"): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

export function GoalActualProgress({ pillars, currencyCode = "EUR" }: GoalActualProgressProps) {
  return (
    <YStack gap="$3">
      <Text color="$color" fontWeight="600" fontSize={16}>
        Meta vs Real
      </Text>

      <XStack gap="$3" flexWrap="wrap">
        {pillars.map((pillar) => {
          const progressColor = getProgressColor(pillar.actualPercentage, pillar.goalPercentage);
          const remaining = pillar.budgetedMinor - pillar.actualMinor;
          const isOverBudget = remaining < 0;

          return (
            <GlassyCard key={pillar.id} flex={1} minWidth={280}>
              <YStack padding="$3" gap="$3">
                {/* Header */}
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <YStack
                      width={12}
                      height={12}
                      borderRadius={6}
                      backgroundColor={pillar.color as any}
                    />
                    <Text color="$color" fontWeight="600" fontSize={15}>
                      {pillar.name}
                    </Text>
                  </XStack>
                  <Text color="$secondaryText" fontSize={12}>
                    Meta: {pillar.goalPercentage}%
                  </Text>
                </XStack>

                {/* Progress Bar */}
                <YStack gap="$1">
                  <Progress
                    value={Math.min(pillar.actualPercentage, 100)}
                    max={pillar.goalPercentage}
                    backgroundColor="$backgroundHover"
                    height={10}
                    borderRadius={5}
                  >
                    <Progress.Indicator backgroundColor={progressColor as any} animation="bouncy" />
                  </Progress>

                  <XStack justifyContent="space-between">
                    <Text color={progressColor as any} fontSize={12} fontWeight="600">
                      {pillar.actualPercentage.toFixed(1)}%
                    </Text>
                    <Text color="$secondaryText" fontSize={12}>
                      {pillar.goalPercentage}%
                    </Text>
                  </XStack>
                </YStack>

                {/* Amounts */}
                <XStack justifyContent="space-between" alignItems="flex-end">
                  <YStack>
                    <Text color="$secondaryText" fontSize={11}>
                      Gasto
                    </Text>
                    <Text color="$color" fontWeight="600">
                      {formatCurrency(pillar.actualMinor, currencyCode)}
                    </Text>
                  </YStack>

                  <YStack alignItems="flex-end">
                    <Text color="$secondaryText" fontSize={11}>
                      Orçado
                    </Text>
                    <Text color="$color" fontWeight="600">
                      {formatCurrency(pillar.budgetedMinor, currencyCode)}
                    </Text>
                  </YStack>

                  <YStack alignItems="flex-end">
                    <Text color="$secondaryText" fontSize={11}>
                      {isOverBudget ? "Excesso" : "Restante"}
                    </Text>
                    <Text color={isOverBudget ? "#ef4444" : "#22c55e"} fontWeight="600">
                      {formatCurrency(Math.abs(remaining), currencyCode)}
                    </Text>
                  </YStack>
                </XStack>
              </YStack>
            </GlassyCard>
          );
        })}
      </XStack>
    </YStack>
  );
}

/**
 * Calculate budget pillars from category groups and transactions
 */
export function calculatePillarsFromGroups(
  groups: Array<{
    id: string;
    name: string;
    targetPercent?: number;
    color?: string;
    categories?: Array<{
      items?: Array<{
        budgetedMinor?: number;
        actualMinor?: number;
      }>;
    }>;
  }>,
  totalIncomeMinor: number,
): BudgetPillar[] {
  return groups.map((group, index) => {
    // Sum all items
    const budgetedMinor =
      group.categories?.reduce((groupSum, cat) => {
        const catSum =
          cat.items?.reduce((itemSum, item) => itemSum + (item.budgetedMinor ?? 0), 0) ?? 0;
        return groupSum + catSum;
      }, 0) ?? 0;

    const actualMinor =
      group.categories?.reduce((groupSum, cat) => {
        const catSum =
          cat.items?.reduce((itemSum, item) => itemSum + (item.actualMinor ?? 0), 0) ?? 0;
        return groupSum + catSum;
      }, 0) ?? 0;

    const goalPercentage = group.targetPercent ?? 0;
    const actualPercentage = totalIncomeMinor > 0 ? (actualMinor / totalIncomeMinor) * 100 : 0;

    const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899"];

    return {
      id: group.id,
      name: group.name,
      goalPercentage,
      actualPercentage,
      budgetedMinor,
      actualMinor,
      color: group.color ?? colors[index % colors.length],
    };
  });
}
