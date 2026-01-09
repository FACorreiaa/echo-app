/**
 * MonthlyBudgetView - Component for viewing/editing monthly budget values
 *
 * Features:
 * - Month selector (< January 2025 >)
 * - Item list with editable budgets
 * - "Copy from Previous Month" button for smart duplication
 */

import { ChevronLeft, ChevronRight, Copy } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Alert, Pressable, ScrollView } from "react-native";
import { Button, H3, Input, Progress, Spinner, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import {
  formatPeriodMoney,
  getMonthName,
  getNextMonth,
  getPreviousMonth,
  useBudgetPeriod,
  useCopyBudgetPeriod,
  useUpdateBudgetPeriodItem,
  type BudgetPeriodItem,
} from "@/lib/hooks/use-budget-period";

interface MonthlyBudgetViewProps {
  planId: string;
  currencyCode?: string;
}

export function MonthlyBudgetView({ planId, currencyCode = "EUR" }: MonthlyBudgetViewProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data, isLoading, error } = useBudgetPeriod(planId, year, month);
  const copyPeriod = useCopyBudgetPeriod();
  const updateItem = useUpdateBudgetPeriodItem();

  const goToPreviousMonth = () => {
    const prev = getPreviousMonth(year, month);
    setYear(prev.year);
    setMonth(prev.month);
  };

  const goToNextMonth = () => {
    const next = getNextMonth(year, month);
    setYear(next.year);
    setMonth(next.month);
  };

  const handleCopyFromPrevious = async () => {
    const prev = getPreviousMonth(year, month);

    Alert.alert(
      "Copy from Previous Month",
      `Copy budget values from ${getMonthName(prev.month)} ${prev.year} to ${getMonthName(month)} ${year}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Copy",
          onPress: async () => {
            try {
              // First get the previous month's period ID
              const response = await copyPeriod.mutateAsync({
                sourcePeriodId: data?.period?.id ?? "", // Will be fetched by backend
                targetPlanId: planId,
                targetYear: year,
                targetMonth: month,
              });
              Alert.alert(
                "Success",
                `Copied ${response.items.length} items from ${getMonthName(prev.month)}`,
              );
            } catch (error) {
              console.error("[MonthlyBudgetView] Copy failed:", error);
              Alert.alert("Error", "Failed to copy budget values");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <YStack alignItems="center" padding="$4">
        <Spinner size="large" color="$accentColor" />
        <Text color="$secondaryText" marginTop="$2">
          Loading {getMonthName(month)} budget...
        </Text>
      </YStack>
    );
  }

  if (error) {
    return (
      <GlassyCard>
        <YStack padding="$4" alignItems="center">
          <Text color="$red10">Failed to load budget period</Text>
        </YStack>
      </GlassyCard>
    );
  }

  const period = data?.period;
  const items = period?.items ?? [];

  // Calculate totals
  const totalBudgeted = items.reduce((sum, item) => sum + Number(item.budgetedMinor), 0);
  const totalActual = items.reduce((sum, item) => sum + Number(item.actualMinor), 0);
  const usagePercent = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

  return (
    <YStack gap="$3">
      {/* Month Selector */}
      <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$2">
        <Pressable onPress={goToPreviousMonth}>
          <XStack
            backgroundColor="$backgroundHover"
            padding="$2"
            borderRadius="$3"
            alignItems="center"
          >
            <ChevronLeft size={20} color="$color" />
          </XStack>
        </Pressable>

        <YStack alignItems="center">
          <H3 color="$color">
            {getMonthName(month)} {year}
          </H3>
          {data?.wasCreated && (
            <Text color="$accentColor" fontSize={12}>
              New period created
            </Text>
          )}
        </YStack>

        <Pressable onPress={goToNextMonth}>
          <XStack
            backgroundColor="$backgroundHover"
            padding="$2"
            borderRadius="$3"
            alignItems="center"
          >
            <ChevronRight size={20} color="$color" />
          </XStack>
        </Pressable>
      </XStack>

      {/* Copy from Previous Button */}
      <Button
        size="$3"
        backgroundColor="$backgroundHover"
        borderWidth={1}
        borderColor="$borderColor"
        icon={<Copy size={16} color="$accentColor" />}
        onPress={handleCopyFromPrevious}
        disabled={copyPeriod.isPending}
      >
        <Text color="$accentColor">
          {copyPeriod.isPending ? "Copying..." : "Copy from Previous Month"}
        </Text>
      </Button>

      {/* Summary Card */}
      <GlassyCard>
        <YStack padding="$3" gap="$2">
          <XStack justifyContent="space-between">
            <YStack>
              <Text color="$secondaryText" fontSize={12}>
                Budgeted
              </Text>
              <Text color="$color" fontWeight="600">
                {formatPeriodMoney(BigInt(totalBudgeted), currencyCode)}
              </Text>
            </YStack>
            <YStack alignItems="flex-end">
              <Text color="$secondaryText" fontSize={12}>
                Actual
              </Text>
              <Text color={totalActual > totalBudgeted ? "$red10" : "$color"} fontWeight="600">
                {formatPeriodMoney(BigInt(totalActual), currencyCode)}
              </Text>
            </YStack>
          </XStack>
          <Progress value={Math.min(usagePercent, 100)} backgroundColor="$backgroundHover">
            <Progress.Indicator backgroundColor={usagePercent > 100 ? "#ef4444" : "$accentColor"} />
          </Progress>
          <Text color="$secondaryText" fontSize={12} textAlign="center">
            {usagePercent.toFixed(0)}% of budget used
          </Text>
        </YStack>
      </GlassyCard>

      {/* Items List */}
      <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
        <YStack gap="$2">
          {items.length === 0 ? (
            <GlassyCard>
              <YStack padding="$4" alignItems="center">
                <Text color="$secondaryText">No budget items for this period</Text>
              </YStack>
            </GlassyCard>
          ) : (
            items.map((item) => (
              <BudgetItemRow
                key={item.id}
                item={item}
                currencyCode={currencyCode}
                onUpdate={(budgetedMinor) => {
                  updateItem.mutate({
                    periodItemId: item.id,
                    budgetedMinor,
                  });
                }}
              />
            ))
          )}
        </YStack>
      </ScrollView>
    </YStack>
  );
}

// ============================================================================
// Budget Item Row
// ============================================================================

interface BudgetItemRowProps {
  item: BudgetPeriodItem;
  currencyCode: string;
  onUpdate: (budgetedMinor: bigint) => void;
}

function BudgetItemRow({ item, currencyCode, onUpdate }: BudgetItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState((Number(item.budgetedMinor) / 100).toFixed(2));

  const handleSave = () => {
    const amount = parseFloat(editValue.replace(",", ".")) || 0;
    onUpdate(BigInt(Math.round(amount * 100)));
    setIsEditing(false);
  };

  const usagePercent =
    Number(item.budgetedMinor) > 0
      ? (Number(item.actualMinor) / Number(item.budgetedMinor)) * 100
      : 0;

  return (
    <Pressable onPress={() => setIsEditing(true)}>
      <XStack
        backgroundColor="rgba(255,255,255,0.05)"
        padding="$3"
        borderRadius="$3"
        justifyContent="space-between"
        alignItems="center"
      >
        <YStack flex={1}>
          <Text color="$color" fontWeight="500">
            {item.itemName}
          </Text>
          <Text color="$secondaryText" fontSize={12}>
            {item.categoryName}
          </Text>
        </YStack>

        <YStack alignItems="flex-end" minWidth={100}>
          {isEditing ? (
            <Input
              size="$3"
              width={100}
              value={editValue}
              onChangeText={setEditValue}
              onBlur={handleSave}
              keyboardType="decimal-pad"
              autoFocus
              backgroundColor="$backgroundHover"
              textAlign="right"
            />
          ) : (
            <>
              <Text color="$color" fontWeight="600">
                {formatPeriodMoney(item.budgetedMinor, currencyCode)}
              </Text>
              <Text color={usagePercent > 100 ? "$red10" : "$secondaryText"} fontSize={12}>
                {formatPeriodMoney(item.actualMinor, currencyCode)} spent
              </Text>
            </>
          )}
        </YStack>
      </XStack>
    </Pressable>
  );
}
