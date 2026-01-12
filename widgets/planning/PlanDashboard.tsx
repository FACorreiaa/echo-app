/**
 * PlanDashboard - Main dashboard view for financial plan visualization
 * Features:
 * - Horizontal bar chart showing spending by category
 * - Bento-style grid layout with summary cards
 * - Tap-to-drill category details
 */

import { Calendar, Copy, Pencil, TrendingUp, Wallet } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { PlanCategoryGroup, UserPlan } from "@/lib/hooks/use-plans";

import { CategoryDetailCard, type CategoryDetailData } from "./CategoryDetailCard";
import {
  CATEGORY_COLORS,
  CategorySpendingChart,
  type CategorySpendingData,
} from "./CategorySpendingChart";
import { EditPlanSheet } from "./EditPlanSheet";
import { IncomeSpendingChart } from "./IncomeSpendingChart";
import { ReplicatePlanSheet } from "./ReplicatePlanSheet";

interface PlanDashboardProps {
  plan: UserPlan;
  categoryGroups?: PlanCategoryGroup[];
  onCategoryPress?: (groupId: string) => void;
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

// Transform category groups to chart data (Expenses/Savings only)
function groupsToChartData(groups: PlanCategoryGroup[]): CategorySpendingData[] {
  return groups
    .map((group, index) => {
      const budgetedMinor =
        group.categories?.reduce((groupSum, cat) => {
          const catSum =
            cat.items?.reduce((itemSum, item) => {
              // Exclude Income items from "Where Money Goes" chart
              if (item.itemType === "income") return itemSum;
              return itemSum + (item.budgeted ?? 0) * 100;
            }, 0) ?? 0;
          return groupSum + catSum;
        }, 0) ?? 0;

      return {
        id: group.id,
        name: group.name,
        budgetedMinor,
        actualMinor: 0,
        color: group.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      };
    })
    .filter((g) => g.budgetedMinor > 0); // Hide zero-value groups (e.g. purely Income groups)
}

// Transform category groups to detail card data
function groupsToDetailData(groups: PlanCategoryGroup[]): CategoryDetailData[] {
  return groups.map((group, index) => {
    const items =
      group.categories?.flatMap(
        (cat) =>
          cat.items?.map((item) => ({
            id: item.id,
            name: item.name,
            budgetedMinor: (item.budgeted ?? 0) * 100,
            actualMinor: 0,
            itemType: item.itemType, // Pass itemType for context if needed
          })) ?? [],
      ) ?? [];

    const budgetedMinor = items.reduce((sum, item) => sum + item.budgetedMinor, 0);

    return {
      id: group.id,
      name: group.name,
      color: group.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      budgetedMinor,
      actualMinor: 0,
      items,
    };
  });
}

export function PlanDashboard({ plan, categoryGroups = [], onCategoryPress }: PlanDashboardProps) {
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [isReplicateSheetOpen, setIsReplicateSheetOpen] = useState(false);

  const chartData = groupsToChartData(categoryGroups);
  const detailData = groupsToDetailData(categoryGroups);

  // Calculate totals for Income vs Spending chart
  const { incomeTotal, expenseTotal, savingsTotal } = React.useMemo(() => {
    let incomeTotal = 0;
    let expenseTotal = 0;
    let savingsTotal = 0;

    categoryGroups.forEach((g) => {
      g.categories.forEach((c) => {
        c.items.forEach((i) => {
          const amount = (i.budgeted ?? 0) * 100;
          if (i.itemType === "income") {
            incomeTotal += amount;
          } else if (i.itemType === "goal") {
            savingsTotal += amount;
          } else {
            expenseTotal += amount; // Budget, Recurring, Debt
          }
        });
      });
    });

    // Fallback: If no income items defined, use plan.totalIncome
    if (incomeTotal === 0 && plan.totalIncome > 0) {
      incomeTotal = plan.totalIncome * 100;
    }

    return { incomeTotal, expenseTotal, savingsTotal };
  }, [categoryGroups, plan.totalIncome]);

  const totalBudgeted = chartData.reduce((sum, item) => sum + item.budgetedMinor, 0);
  const surplus = incomeTotal / 100 - totalBudgeted / 100; // Recalculate surplus based on items

  const handleCategoryPress = (category: CategorySpendingData) => {
    onCategoryPress?.(category.id);
  };

  return (
    <>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <YStack gap="$4" padding="$4">
          {/* Plan Header with Actions */}
          <XStack justifyContent="space-between" alignItems="center">
            <YStack gap="$1" flex={1}>
              <Text color="$color" fontWeight="700" fontSize={24}>
                {plan.name}
              </Text>
              {plan.description && (
                <Text color="$secondaryText" fontSize={14}>
                  {plan.description}
                </Text>
              )}
            </YStack>

            {/* Action Buttons */}
            <XStack gap="$3" alignItems="center">
              {/* Replicate Button */}
              <Pressable onPress={() => setIsReplicateSheetOpen(true)}>
                <YStack
                  backgroundColor="$backgroundHover"
                  padding="$2.5"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                  opacity={0.9}
                >
                  <Copy size={20} color="$color" />
                </YStack>
              </Pressable>

              {/* Edit Button (Pencil) */}
              <Pressable onPress={() => setIsEditSheetOpen(true)}>
                <YStack backgroundColor="$accentColor" padding="$2.5" borderRadius="$3">
                  <Pencil size={20} color="white" />
                </YStack>
              </Pressable>
            </XStack>
          </XStack>

          {/* Summary Bento Cards */}
          <XStack gap="$3" flexWrap="wrap">
            <GlassyCard flex={1} minWidth={150}>
              <YStack padding="$3" gap="$2">
                <XStack gap="$2" alignItems="center">
                  <Wallet size={16} color="$accentColor" />
                  <Text color="$secondaryText" fontSize={12}>
                    Total Budget
                  </Text>
                </XStack>
                <Text color="$color" fontWeight="700" fontSize={20}>
                  {formatCurrency(totalBudgeted, plan.currencyCode)}
                </Text>
              </YStack>
            </GlassyCard>

            <GlassyCard flex={1} minWidth={150}>
              <YStack padding="$3" gap="$2">
                <XStack gap="$2" alignItems="center">
                  <TrendingUp size={16} color={surplus >= 0 ? "#22c55e" : "#ef4444"} />
                  <Text color="$secondaryText" fontSize={12}>
                    Surplus / Deficit
                  </Text>
                </XStack>
                <Text color={surplus >= 0 ? "#22c55e" : "#ef4444"} fontWeight="700" fontSize={20}>
                  {formatCurrency(surplus * 100, plan.currencyCode)}
                </Text>
              </YStack>
            </GlassyCard>

            <GlassyCard flex={1} minWidth={150}>
              <YStack padding="$3" gap="$2">
                <XStack gap="$2" alignItems="center">
                  <Calendar size={16} color="$accentColor" />
                  <Text color="$secondaryText" fontSize={12}>
                    Period
                  </Text>
                </XStack>
                <Text color="$color" fontWeight="700" fontSize={20}>
                  {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </Text>
              </YStack>
            </GlassyCard>
          </XStack>

          {/* Income vs Spending Chart */}
          <IncomeSpendingChart
            incomeTotal={incomeTotal}
            expenseTotal={expenseTotal}
            savingsTotal={savingsTotal}
            currencyCode={plan.currencyCode}
          />

          {/* Spending Chart */}
          <GlassyCard>
            <CategorySpendingChart
              data={chartData}
              currencyCode={plan.currencyCode}
              onCategoryPress={handleCategoryPress}
              showActual
            />
          </GlassyCard>

          {/* Category Details */}
          <YStack gap="$3">
            <Text color="$color" fontWeight="600" fontSize={16}>
              Spending Categories
            </Text>
            {detailData.map((category) => (
              <CategoryDetailCard
                key={category.id}
                category={category}
                currencyCode={plan.currencyCode}
              />
            ))}
          </YStack>
        </YStack>
      </ScrollView>

      {/* Sheets */}
      <EditPlanSheet planId={plan.id} open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen} />

      <ReplicatePlanSheet
        sourcePlanId={plan.id}
        open={isReplicateSheetOpen}
        onOpenChange={setIsReplicateSheetOpen}
      />
    </>
  );
}

export { type CategoryDetailData, type CategorySpendingData };
