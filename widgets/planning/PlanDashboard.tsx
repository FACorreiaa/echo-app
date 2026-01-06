/**
 * PlanDashboard - Main dashboard view for financial plan visualization
 * Features:
 * - Horizontal bar chart showing spending by category
 * - Bento-style grid layout with summary cards
 * - Tap-to-drill category details
 */

import { Calendar, TrendingUp, Wallet } from "@tamagui/lucide-icons";
import React from "react";
import { ScrollView } from "react-native";
import { Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { PlanCategoryGroup, UserPlan } from "@/lib/hooks/use-plans";

import { CategoryDetailCard, type CategoryDetailData } from "./CategoryDetailCard";
import {
  CATEGORY_COLORS,
  CategorySpendingChart,
  type CategorySpendingData,
} from "./CategorySpendingChart";

interface PlanDashboardProps {
  plan: UserPlan;
  categoryGroups?: PlanCategoryGroup[];
  onCategoryPress?: (groupId: string) => void;
}

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

// Transform category groups to chart data
function groupsToChartData(groups: PlanCategoryGroup[]): CategorySpendingData[] {
  return groups.map((group, index) => {
    // Sum all items in all categories within the group
    // Note: items use 'budgeted' in major units, convert to minor (*100)
    const budgetedMinor =
      group.categories?.reduce((groupSum, cat) => {
        const catSum =
          cat.items?.reduce((itemSum, item) => itemSum + (item.budgeted ?? 0) * 100, 0) ?? 0;
        return groupSum + catSum;
      }, 0) ?? 0;

    return {
      id: group.id,
      name: group.name,
      budgetedMinor,
      actualMinor: 0, // TODO: Wire up actual spending from transactions
      color: group.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    };
  });
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
            budgetedMinor: (item.budgeted ?? 0) * 100, // Convert major to minor
            actualMinor: 0, // TODO: Wire up actual
          })) ?? [],
      ) ?? [];

    const budgetedMinor = items.reduce((sum, item) => sum + item.budgetedMinor, 0);

    return {
      id: group.id,
      name: group.name,
      color: group.color ?? CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      budgetedMinor,
      actualMinor: 0, // TODO: Wire up actual
      items,
    };
  });
}

export function PlanDashboard({ plan, categoryGroups = [], onCategoryPress }: PlanDashboardProps) {
  const chartData = groupsToChartData(categoryGroups);
  const detailData = groupsToDetailData(categoryGroups);

  // Calculate totals
  const totalBudgeted = chartData.reduce((sum, item) => sum + item.budgetedMinor, 0);

  const surplus = (plan.totalIncome ?? 0) - totalBudgeted;

  const handleCategoryPress = (category: CategorySpendingData) => {
    // setSelectedGroupId(category.id);
    onCategoryPress?.(category.id);
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      <YStack gap="$4" padding="$4">
        {/* Plan Header */}
        <YStack gap="$1">
          <Text color="$color" fontWeight="700" fontSize={24}>
            {plan.name}
          </Text>
          {plan.description && (
            <Text color="$secondaryText" fontSize={14}>
              {plan.description}
            </Text>
          )}
        </YStack>

        {/* Summary Bento Cards */}
        <XStack gap="$3" flexWrap="wrap">
          {/* Total Budget Card */}
          <GlassyCard flex={1} minWidth={150}>
            <YStack padding="$3" gap="$2">
              <XStack gap="$2" alignItems="center">
                <Wallet size={16} color="$accentColor" />
                <Text color="$secondaryText" fontSize={12}>
                  Orçamento Total
                </Text>
              </XStack>
              <Text color="$color" fontWeight="700" fontSize={20}>
                {formatCurrency(totalBudgeted, plan.currencyCode)}
              </Text>
            </YStack>
          </GlassyCard>

          {/* Surplus Card */}
          <GlassyCard flex={1} minWidth={150}>
            <YStack padding="$3" gap="$2">
              <XStack gap="$2" alignItems="center">
                <TrendingUp size={16} color={surplus >= 0 ? "#22c55e" : "#ef4444"} />
                <Text color="$secondaryText" fontSize={12}>
                  Sobra / Déficit
                </Text>
              </XStack>
              <Text color={surplus >= 0 ? "#22c55e" : "#ef4444"} fontWeight="700" fontSize={20}>
                {formatCurrency(surplus, plan.currencyCode)}
              </Text>
            </YStack>
          </GlassyCard>

          {/* Month Card */}
          <GlassyCard flex={1} minWidth={150}>
            <YStack padding="$3" gap="$2">
              <XStack gap="$2" alignItems="center">
                <Calendar size={16} color="$accentColor" />
                <Text color="$secondaryText" fontSize={12}>
                  Período
                </Text>
              </XStack>
              <Text color="$color" fontWeight="700" fontSize={20}>
                {new Date().toLocaleDateString("pt-PT", { month: "short", year: "numeric" })}
              </Text>
            </YStack>
          </GlassyCard>
        </XStack>

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
            Categorias de Despesa
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
  );
}

export { type CategoryDetailData, type CategorySpendingData };
