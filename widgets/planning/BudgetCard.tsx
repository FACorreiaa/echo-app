import { AlertTriangle } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import { Progress, Separator, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
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

  // Use hex values for icon colors (theme tokens don't work reliably)
  const statusColor = isOverBudget ? "#ef4444" : isNearLimit ? "#f97316" : "#22c55e";
  const progressColor = isOverBudget ? "$red10" : isNearLimit ? "$orange10" : "$accentColor";

  return (
    <Pressable onPress={onPress}>
      <GlassyCard>
        <YStack padding="$4" gap="$3">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$3">
              <XStack
                width={36}
                height={36}
                borderRadius="$4"
                backgroundColor="$backgroundHover"
                alignItems="center"
                justifyContent="center"
              >
                {/* Category Emoji Placeholder - ideally passed in or mapped */}
                <Text fontSize={18}>🏷️</Text>
              </XStack>
              <YStack>
                <Text color="$color" fontSize={16} fontWeight="700">
                  {item.name}
                </Text>
                <Text color="$secondaryText" fontSize={11}>
                  Budget: {formatMoney(item.budgetedMinor)}
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

          {/* Progress Section */}
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="flex-end">
              <Text color="$secondaryText" fontSize={11} fontWeight="500">
                Spent
              </Text>
              <Text color="$color" fontWeight="700" fontSize={14}>
                {formatMoney(item.actualMinor)}
              </Text>
            </XStack>

            <Progress value={Math.min(progress, 100)} size="$2" backgroundColor="$backgroundHover">
              <Progress.Indicator animation="bouncy" backgroundColor={progressColor as any} />
            </Progress>

            <XStack justifyContent="flex-end">
              <Text color={statusColor as any} fontSize={11} fontWeight="600">
                {isOverBudget
                  ? `${formatMoney(BigInt(Math.abs(remaining)))} over`
                  : `${formatMoney(BigInt(remaining))} left`}
              </Text>
            </XStack>
          </YStack>
        </YStack>
      </GlassyCard>
    </Pressable>
  );
}
