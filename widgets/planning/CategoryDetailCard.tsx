/**
 * CategoryDetailCard - Expandable card showing budget items within a category
 * Shows progress bar for budget consumption with drill-down capability
 * Supports inline editing of items via long-press
 */

import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { Progress, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";

import { EditableItemRow } from "./EditableItemRow";

// Types
export interface BudgetItem {
  id: string;
  name: string;
  budgetedMinor: number;
  actualMinor?: number;
  itemType?: string;
}

export interface CategoryDetailData {
  id: string;
  name: string;
  color: string;
  budgetedMinor: number;
  actualMinor?: number;
  items: BudgetItem[];
}

interface CategoryDetailCardProps {
  category: CategoryDetailData;
  currencyCode?: string;
  onItemPress?: (item: BudgetItem) => void;
  onItemSave?: (
    item: BudgetItem,
    updates: { name?: string; budgetedMinor?: number },
  ) => Promise<void>;
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

// Get progress color based on percentage
function getProgressColor(percentage: number): string {
  if (percentage <= 60) return "#22c55e"; // green
  if (percentage <= 85) return "#f59e0b"; // amber
  return "#ef4444"; // red
}

export function CategoryDetailCard({
  category,
  currencyCode = "EUR",
  onItemPress,
  onItemSave,
}: CategoryDetailCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate consumption percentage
  const actualTotal = category.actualMinor ?? 0;
  const percentage =
    category.budgetedMinor > 0 ? Math.min((actualTotal / category.budgetedMinor) * 100, 100) : 0;

  const progressColor = getProgressColor(percentage);

  return (
    <GlassyCard>
      {/* Header - Always visible */}
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        testID={`category-header-${category.id}`}
      >
        <YStack gap="$2" padding="$3">
          <XStack justifyContent="space-between" alignItems="center">
            <XStack gap="$2" alignItems="center">
              <YStack
                width={12}
                height={12}
                borderRadius={6}
                backgroundColor={category.color as any}
              />
              <Text color="$color" fontWeight="600" fontSize={15}>
                {category.name}
              </Text>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <Text color="$secondaryText" fontSize={12}>
                {formatCurrency(actualTotal, currencyCode)} /{" "}
                {formatCurrency(category.budgetedMinor, currencyCode)}
              </Text>
              {isExpanded ? (
                <ChevronUp size={18} color="$secondaryText" />
              ) : (
                <ChevronDown size={18} color="$secondaryText" />
              )}
            </XStack>
          </XStack>

          {/* Progress Bar */}
          <YStack gap="$1">
            <Progress
              value={percentage}
              backgroundColor="$backgroundHover"
              height={8}
              borderRadius={4}
            >
              <Progress.Indicator backgroundColor={progressColor as any} animation="bouncy" />
            </Progress>
            <XStack justifyContent="space-between">
              <Text color={progressColor as any} fontSize={11} fontWeight="500">
                {percentage.toFixed(0)}% used
              </Text>
              {category.budgetedMinor - actualTotal > 0 && (
                <Text color="$secondaryText" fontSize={11}>
                  {formatCurrency(category.budgetedMinor - actualTotal, currencyCode)} remaining
                </Text>
              )}
            </XStack>
          </YStack>
        </YStack>
      </Pressable>

      {/* Expanded Items List with Inline Editing */}
      {isExpanded && (
        <YStack
          paddingHorizontal="$3"
          paddingBottom="$3"
          gap="$2"
          borderTopWidth={1}
          borderColor="$borderColor"
          paddingTop="$2"
        >
          {category.items.length === 0 ? (
            <Text color="$secondaryText" fontSize={12} textAlign="center" paddingVertical="$2">
              No items in this category
            </Text>
          ) : (
            category.items.map((item) => (
              <EditableItemRow
                key={item.id}
                item={item}
                currencyCode={currencyCode}
                onPress={() => onItemPress?.(item)}
                onSave={onItemSave}
              />
            ))
          )}
        </YStack>
      )}
    </GlassyCard>
  );
}
