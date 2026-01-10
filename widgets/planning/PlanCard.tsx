/**
 * PlanCard - Displays a financial plan summary as a Bento card
 */

import { ChevronRight, FileSpreadsheet, Pencil, Star, Trash2 } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import { Progress, Separator, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
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
              <XStack
                width={32}
                height={32}
                alignItems="center"
                justifyContent="center"
                backgroundColor="$backgroundHover"
                borderRadius="$4"
              >
                {isExcel ? (
                  <FileSpreadsheet size={18} color="$accentColor" />
                ) : (
                  <Pencil size={18} color="$accentColor" />
                )}
              </XStack>
              <Text color="$color" fontSize={16} fontWeight="700" numberOfLines={1} flex={1}>
                {plan.name}
              </Text>
            </XStack>

            <XStack gap="$2" alignItems="center">
              {isActive && (
                <XStack
                  backgroundColor="$green2"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$4"
                  alignItems="center"
                  gap="$1.5"
                >
                  <Star size={10} color="$green10" fill="$green10" />
                  <Text color="$green11" fontSize={10} fontWeight="700">
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
                  style={{ opacity: 0.8 }}
                >
                  <Trash2 size={16} color="$red10" />
                </Pressable>
              )}

              {!isActive && <ChevronRight size={16} color="$secondaryText" />}
            </XStack>
          </XStack>

          <Separator borderColor="$borderColor" opacity={0.5} />

          {/* Summary Stats */}
          <XStack justifyContent="space-between" gap="$2">
            <YStack flex={1}>
              <Text color="$secondaryText" fontSize={11} marginBottom={2}>
                Income
              </Text>
              <Text color="#22c55e" fontWeight="700" fontSize={14}>
                {formatMoney(plan.totalIncome, plan.currencyCode)}
              </Text>
            </YStack>
            <YStack flex={1} alignItems="center">
              <Text color="$secondaryText" fontSize={11} marginBottom={2}>
                Expenses
              </Text>
              <Text color="#ef4444" fontWeight="700" fontSize={14}>
                {formatMoney(plan.totalExpenses, plan.currencyCode)}
              </Text>
            </YStack>
            <YStack flex={1} alignItems="flex-end">
              <Text color="$secondaryText" fontSize={11} marginBottom={2}>
                Surplus
              </Text>
              <Text
                color={plan.surplus >= 0 ? "#22c55e" : "#ef4444"}
                fontWeight="700"
                fontSize={14}
              >
                {formatMoney(plan.surplus, plan.currencyCode)}
              </Text>
            </YStack>
          </XStack>

          {/* Progress Bar */}
          <YStack gap="$2">
            <XStack justifyContent="space-between">
              <Text color="$color11" fontSize={12}>
                Budget Used
              </Text>
              <Text color="$secondaryText" fontSize={12} fontWeight="500">
                {savingsRate}% savings rate
              </Text>
            </XStack>
            <Progress
              value={Math.min(incomeUsed, 100)}
              size="$2"
              backgroundColor="$backgroundHover"
            >
              <Progress.Indicator
                animation="bouncy"
                backgroundColor={incomeUsed > 100 ? "$red10" : "$accentColor"}
              />
            </Progress>
          </YStack>

          {/* Category Groups Preview */}
          {plan.categoryGroups.length > 0 && (
            <XStack flexWrap="wrap" gap="$1.5" marginTop="$1">
              {plan.categoryGroups.slice(0, 3).map((group) => (
                <XStack
                  key={group.id}
                  backgroundColor="$backgroundHover"
                  paddingHorizontal="$2"
                  paddingVertical="$1.5"
                  borderRadius="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Text color="$color11" fontSize={10} fontWeight="500">
                    {group.name}
                  </Text>
                </XStack>
              ))}
              {plan.categoryGroups.length > 3 && (
                <XStack
                  paddingHorizontal="$2"
                  paddingVertical="$1.5"
                  borderRadius="$3"
                  backgroundColor="$backgroundHover"
                >
                  <Text color="$secondaryText" fontSize={10} fontWeight="500">
                    +{plan.categoryGroups.length - 3}
                  </Text>
                </XStack>
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
                backgroundColor="$backgroundHover"
                borderRadius="$3"
                marginTop="$2"
              >
                <Text color="$accentColor" fontSize={12} fontWeight="600">
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
