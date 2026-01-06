/**
 * PlanCard - Displays a financial plan summary as a Bento card
 */

import { ChevronRight, FileSpreadsheet, Pencil, Star, Trash2 } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import { Progress, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";
import type { UserPlan } from "@/lib/hooks/use-plans";
import { formatMoney } from "@/lib/hooks/use-plans";

interface PlanCardProps {
  plan: UserPlan;
  onPress?: () => void;
  onSetActive?: () => void;
  onDelete?: () => void;
}

export function PlanCard({ plan, onPress, onSetActive, onDelete }: PlanCardProps) {
  const savingsRate =
    plan.totalIncome > 0 ? ((plan.surplus / plan.totalIncome) * 100).toFixed(0) : "0";

  const incomeUsed = plan.totalIncome > 0 ? (plan.totalExpenses / plan.totalIncome) * 100 : 0;

  const isActive = plan.status === "active";
  const isExcel = plan.sourceType === "excel";

  return (
    <Pressable onPress={onPress}>
      <GlassyCard>
        <YStack padding="$4" gap="$3">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$2" flex={1}>
              {isExcel ? (
                <FileSpreadsheet size={20} color="$accentColor" />
              ) : (
                <Pencil size={20} color="$accentColor" />
              )}
              <Text color="$color" fontWeight="600" numberOfLines={1} flex={1}>
                {plan.name}
              </Text>
            </XStack>
            <XStack gap="$3" alignItems="center">
              {isActive && (
                <XStack
                  backgroundColor="$accentColor"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text color="white" fontSize={12} fontWeight="bold">
                    ACTIVE
                  </Text>
                </XStack>
              )}

              {onDelete && !isActive && (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  hitSlop={8}
                >
                  <Trash2 size={18} color="$red10" />
                </Pressable>
              )}

              <ChevronRight size={18} color="$secondaryText" />
            </XStack>
          </XStack>

          {/* Summary Stats */}
          <XStack justifyContent="space-between">
            <YStack>
              <Text color="$secondaryText" fontSize={12}>
                Income
              </Text>
              <Text color="#22c55e" fontWeight="600">
                {formatMoney(plan.totalIncome, plan.currencyCode)}
              </Text>
            </YStack>
            <YStack alignItems="center">
              <Text color="$secondaryText" fontSize={12}>
                Expenses
              </Text>
              <Text color="#ef4444" fontWeight="600">
                {formatMoney(plan.totalExpenses, plan.currencyCode)}
              </Text>
            </YStack>
            <YStack alignItems="flex-end">
              <Text color="$secondaryText" fontSize={12}>
                Surplus
              </Text>
              <Text color={plan.surplus >= 0 ? "#22c55e" : "#ef4444"} fontWeight="600">
                {formatMoney(plan.surplus, plan.currencyCode)}
              </Text>
            </YStack>
          </XStack>

          {/* Progress Bar */}
          <YStack gap="$1">
            <XStack justifyContent="space-between">
              <Text color="$secondaryText" fontSize={12}>
                Budget Used
              </Text>
              <Text color="$secondaryText" fontSize={12}>
                {savingsRate}% savings rate
              </Text>
            </XStack>
            <Progress value={Math.min(incomeUsed, 100)} backgroundColor="$backgroundHover">
              <Progress.Indicator backgroundColor={incomeUsed > 100 ? "#ef4444" : "$accentColor"} />
            </Progress>
          </YStack>

          {/* Category Groups Preview */}
          {plan.categoryGroups.length > 0 && (
            <XStack flexWrap="wrap" gap="$1">
              {plan.categoryGroups.slice(0, 3).map((group) => (
                <XStack
                  key={group.id}
                  backgroundColor={(group.color ?? "$backgroundHover") as any}
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text color="white" fontSize={10} fontWeight="500">
                    {group.name}
                  </Text>
                </XStack>
              ))}
              {plan.categoryGroups.length > 3 && (
                <Text color="$secondaryText" fontSize={10}>
                  +{plan.categoryGroups.length - 3} more
                </Text>
              )}
            </XStack>
          )}

          {/* Set Active Button (if not already active) */}
          {!isActive && onSetActive && (
            <Pressable onPress={onSetActive}>
              <XStack
                justifyContent="center"
                alignItems="center"
                gap="$2"
                paddingVertical="$2"
                borderTopWidth={1}
                borderTopColor="$borderColor"
                marginTop="$2"
              >
                <Star size={14} color="$accentColor" />
                <Text color="$accentColor" fontSize={12} fontWeight="500">
                  Set as Active Plan
                </Text>
              </XStack>
            </Pressable>
          )}
        </YStack>
      </GlassyCard>
    </Pressable>
  );
}
