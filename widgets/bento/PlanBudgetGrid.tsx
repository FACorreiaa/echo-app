/**
 * PlanBudgetGrid - Renders plan categories as BudgetCategoryPacing widgets
 * Maps each Excel budget row to a visual widget showing spent vs budgeted
 */

import React from "react";
import { Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { PlanCategory, UserPlan } from "@/lib/hooks/use-plans";
import { BentoCard } from "./BentoCard";
import { BudgetCategoryPacing } from "./BudgetCategoryPacing";

interface PlanBudgetGridProps {
  /** The user plan to render */
  plan: UserPlan;
  /** Optional: actual spending data by category ID */
  actuals?: Record<string, number>;
  /** Show compact cards in grid vs expanded list */
  compact?: boolean;
  /** Maximum number of categories to show */
  maxItems?: number;
}

// Get emoji for category name
const getCategoryEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  const emojiMap: Record<string, string> = {
    groceries: "🛒",
    food: "🍽️",
    dining: "🍽️",
    transport: "🚗",
    utilities: "💡",
    rent: "🏠",
    mortgage: "🏠",
    housing: "🏠",
    entertainment: "🎬",
    shopping: "🛍️",
    health: "🏥",
    insurance: "🛡️",
    savings: "💰",
    investment: "📈",
    travel: "✈️",
    education: "📚",
    subscriptions: "📱",
    clothing: "👕",
    personal: "💇",
    gifts: "🎁",
    pets: "🐕",
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (lower.includes(key)) return emoji;
  }
  return "💳";
};

export function PlanBudgetGrid({
  plan,
  actuals = {},
  compact = false,
  maxItems = 6,
}: PlanBudgetGridProps) {
  // Flatten all categories from groups
  const allCategories: PlanCategory[] = plan.categoryGroups.flatMap((group) => group.categories);

  // Take first N categories
  const visibleCategories = allCategories.slice(0, maxItems);

  if (visibleCategories.length === 0) {
    return (
      <GlassyCard>
        <YStack padding="$4" alignItems="center">
          <Text fontSize={24}>📊</Text>
          <Text color="$secondaryText" marginTop="$2">
            No budget categories in this plan
          </Text>
        </YStack>
      </GlassyCard>
    );
  }

  if (compact) {
    return (
      <XStack gap="$3" flexWrap="wrap">
        {visibleCategories.map((category) => {
          // Sum budgeted from items
          const budgetedMinor = category.items.reduce(
            (sum, item) => sum + item.budgeted * 100, // Convert to minor units
            0,
          );
          // Get actual spending from props or items
          const actualMinor =
            actuals[category.id] ??
            category.items.reduce((sum, item) => sum + item.actual * 100, 0);

          return (
            <BentoCard key={category.id} size="small" flex={1} minWidth={150}>
              <BudgetCategoryPacing
                category={category.name}
                spentMinor={actualMinor}
                budgetMinor={budgetedMinor}
                emoji={category.icon || getCategoryEmoji(category.name)}
                currencyCode={plan.currencyCode}
                compact
              />
            </BentoCard>
          );
        })}
      </XStack>
    );
  }

  return (
    <YStack gap="$3">
      {visibleCategories.map((category) => {
        const budgetedMinor = category.items.reduce((sum, item) => sum + item.budgeted * 100, 0);
        const actualMinor =
          actuals[category.id] ?? category.items.reduce((sum, item) => sum + item.actual * 100, 0);

        return (
          <BudgetCategoryPacing
            key={category.id}
            category={category.name}
            spentMinor={actualMinor}
            budgetMinor={budgetedMinor}
            emoji={category.icon || getCategoryEmoji(category.name)}
            currencyCode={plan.currencyCode}
          />
        );
      })}
    </YStack>
  );
}

export { PlanBudgetGrid as PlanWidgetGrid };
