/**
 * CategoryDetailCard - Expandable card showing budget items within a category
 * Shows progress bar for budget consumption with drill-down capability
 */

import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { Progress, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";

// Types
export interface BudgetItem {
  id: string;
  name: string;
  budgetedMinor: number;
  actualMinor?: number;
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
      <Pressable onPress={() => setIsExpanded(!isExpanded)}>
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
                {percentage.toFixed(0)}% usado
              </Text>
              {category.budgetedMinor - actualTotal > 0 && (
                <Text color="$secondaryText" fontSize={11}>
                  {formatCurrency(category.budgetedMinor - actualTotal, currencyCode)} restante
                </Text>
              )}
            </XStack>
          </YStack>
        </YStack>
      </Pressable>

      {/* Expanded Items List */}
      {isExpanded && (
        <YStack
          paddingHorizontal="$3"
          paddingBottom="$3"
          gap="$2"
          borderTopWidth={1}
          borderColor="$borderColor"
          paddingTop="$2"
        >
          {category.items.map((item) => {
            const itemPercentage =
              item.budgetedMinor > 0 && item.actualMinor
                ? (item.actualMinor / item.budgetedMinor) * 100
                : 0;
            const itemColor = getProgressColor(itemPercentage);

            return (
              <Pressable key={item.id} onPress={() => onItemPress?.(item)}>
                <XStack justifyContent="space-between" alignItems="center" paddingVertical="$1">
                  <YStack flex={1}>
                    <Text color="$color" fontSize={13}>
                      {item.name}
                    </Text>
                    {item.actualMinor !== undefined && (
                      <XStack gap="$2">
                        <Text color="$secondaryText" fontSize={11}>
                          {formatCurrency(item.actualMinor, currencyCode)}
                        </Text>
                        <Text color={itemColor as any} fontSize={11}>
                          ({itemPercentage.toFixed(0)}%)
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                  <Text color="$secondaryText" fontSize={13}>
                    {formatCurrency(item.budgetedMinor, currencyCode)}
                  </Text>
                </XStack>
              </Pressable>
            );
          })}
        </YStack>
      )}
    </GlassyCard>
  );
}
