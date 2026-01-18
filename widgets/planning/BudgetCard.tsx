import { AlertTriangle } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React from "react";
import { Pressable } from "react-native";
import { Separator, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import { getCategoryConfig } from "@/lib/constants/categories";
import type { PlanItemWithConfig } from "@/lib/hooks/use-plan-items-by-tab";
import { formatMoney } from "@/lib/hooks/use-plan-items-by-tab";

interface BudgetCardProps {
  item: PlanItemWithConfig;
  onPress?: () => void;
}

export function BudgetCard({ item, onPress }: BudgetCardProps) {
  const actual = Number(item.actualMinor);
  const budgeted = Number(item.budgetedMinor);

  const progress = budgeted > 0 ? (actual / budgeted) * 100 : 0;
  const remaining = budgeted - actual;

  const isOverBudget = remaining < 0;
  const isNearLimit = !isOverBudget && remaining < budgeted * 0.1; // < 10% remaining

  // Get category config for colors and icon
  const categoryConfig = getCategoryConfig(item.name);

  // Use category color for progress, override for warnings
  const progressColor = isOverBudget ? "#ef4444" : isNearLimit ? "#f97316" : categoryConfig.color;
  const statusColor = isOverBudget ? "#ef4444" : isNearLimit ? "#f97316" : categoryConfig.color;

  return (
    <Pressable onPress={onPress}>
      <GlassyCard>
        <YStack padding="$4" gap="$3">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$3">
              <XStack
                width={40}
                height={40}
                borderRadius="$3"
                backgroundColor={categoryConfig.bgColor as any}
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={20}>{categoryConfig.icon}</Text>
              </XStack>
              <YStack flex={1}>
                <Text color="$color" fontSize={14} fontWeight="700" letterSpacing={0.3}>
                  {item.name.toUpperCase()}
                </Text>
                <Text color="$secondaryText" fontSize={10} letterSpacing={0.5}>
                  BUDGET: {formatMoney(item.budgetedMinor)}
                </Text>
              </YStack>
            </XStack>

            {isOverBudget && (
              <XStack
                backgroundColor="$red2"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$4"
                gap="$1"
                alignItems="center"
              >
                <AlertTriangle size={10} color="$red10" />
                <Text color="$red11" fontSize={10} fontWeight="700">
                  OVER
                </Text>
              </XStack>
            )}
            {!isOverBudget && isNearLimit && (
              <Text color={"#f97316" as any} fontSize={11} fontWeight="600">
                Near Limit
              </Text>
            )}
          </XStack>

          <Separator borderColor="$borderColor" opacity={0.5} />

          {/* Progress Section - Enhanced with colored bars */}
          <YStack gap="$3">
            <XStack justifyContent="space-between" alignItems="flex-end">
              <YStack gap={2}>
                <Text color="$secondaryText" fontSize={10} fontWeight="600" letterSpacing={0.5}>
                  SPENT
                </Text>
                <Text color="$color" fontWeight="700" fontSize={16} letterSpacing={0.3}>
                  {formatMoney(item.actualMinor)}
                </Text>
              </YStack>
              <YStack alignItems="flex-end" gap={2}>
                <Text color="$secondaryText" fontSize={10} fontWeight="600" letterSpacing={0.5}>
                  {progress.toFixed(0)}% USED
                </Text>
                <Text color={statusColor as any} fontSize={12} fontWeight="700" letterSpacing={0.3}>
                  {isOverBudget
                    ? `${formatMoney(BigInt(Math.abs(remaining)))} over`
                    : `${formatMoney(BigInt(remaining))} left`}
                </Text>
              </YStack>
            </XStack>

            {/* Enhanced Progress Bar with Glow */}
            <YStack
              height={8}
              backgroundColor="$backgroundHover"
              borderRadius="$2"
              overflow="hidden"
            >
              <MotiView
                from={{ width: "0%" }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ type: "spring", duration: 1000 }}
                style={{
                  height: "100%",
                  backgroundColor: progressColor,
                  borderRadius: 4,
                  shadowColor: progressColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 6,
                }}
              />
            </YStack>
          </YStack>
        </YStack>
      </GlassyCard>
    </Pressable>
  );
}
