import { AlertTriangle, CheckCircle, TrendingUp, Wallet } from "@tamagui/lucide-icons";
import React, { useMemo } from "react";
import { H4, Paragraph, Progress, Separator, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import { formatBalance, useBalance } from "@/lib/hooks/use-balance";
import { usePlan } from "@/lib/hooks/use-plans";
import { useActivePlanId } from "@/lib/stores/use-active-plan-store";

/**
 * ActivePlanHeader - "The Pulse" of the FinanceOS
 *
 * Displays the real-time health of the user's financial system:
 * 1. Execution: How much of the plan has been spent vs budgeted.
 * 2. Funding: Is the plan fully funded by Net Worth? (Surplus/Deficit)
 */
export const ActivePlanHeader = () => {
  const activePlanId = useActivePlanId();
  const { data: plan, isLoading: planLoading } = usePlan(activePlanId || "");
  const { data: balance, isLoading: balanceLoading } = useBalance();

  // 1. Calculate Execution (Spent vs Budgeted)
  const executionMetrics = useMemo(() => {
    if (!plan || !plan.categoryGroups) return { budgeted: 0, spent: 0, percent: 0 };

    let totalBudgeted = 0;
    let totalSpent = 0;

    // Iterate all groups -> categories -> items
    for (const group of plan.categoryGroups) {
      for (const category of group.categories) {
        for (const item of category.items) {
          // Only count "budget" and "recurring" items for execution (expenses)
          // "Goals" are savings, "Income" is income.
          if (item.itemType === "budget" || item.itemType === "recurring") {
            totalBudgeted += item.budgeted;
            totalSpent += item.actual;
          }
        }
      }
    }

    const percent = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;
    return { budgeted: totalBudgeted, spent: totalSpent, percent };
  }, [plan]);

  // 2. Calculate Funding (Net Worth vs Plan Cost)
  const fundingMetrics = useMemo(() => {
    if (!plan || !balance) return { funded: false, diff: 0, status: "checking" };

    const netWorth = balance.totalNetWorth;
    // Actually, "Plan Cost" is total expenses in the plan (Budget + Recurring + Goals?)
    // "Goals" are internal transfers usually, but if funding via external, it matters.
    // Let's use Plan.TotalExpenses which normally sums up all outflows.

    // In Echo, "TotalExpenses" = Budget + Recurring + Goals (if treated as expense/transfer).
    // Let's use plan.totalExpenses as the "Required Funding".
    const required = plan.totalExpenses;

    const diff = netWorth - required;
    const isFunded = diff >= 0;

    return {
      isFunded,
      diff,
      required,
      netWorth,
    };
  }, [plan, balance, executionMetrics]);

  if (!activePlanId) return null; // No active plan selected
  if (planLoading || balanceLoading) return null; // Or skeleton

  const isOverSpent = executionMetrics.percent > 100;
  const isNearLimit = executionMetrics.percent > 90;

  // Dynamic Colors
  const progressColor = isOverSpent ? "$red10" : isNearLimit ? "$orange10" : "$green10";

  return (
    <GlassyCard p="$4" mb="$4">
      <YStack space="$3">
        {/* Header Row */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center">
            <TrendingUp size={18} color="$color" />
            <H4 size="$4" fontWeight="bold">
              System Health
            </H4>
          </XStack>
          {fundingMetrics.isFunded ? (
            <XStack space="$1.5" alignItems="center" bg="$green2" px="$2" py="$1" borderRadius="$4">
              <CheckCircle size={12} color="$green10" />
              <Text fontSize={11} color="$green11" fontWeight="600">
                FULLY FUNDED
              </Text>
            </XStack>
          ) : (
            <XStack space="$1.5" alignItems="center" bg="$red2" px="$2" py="$1" borderRadius="$4">
              <AlertTriangle size={12} color="$red10" />
              <Text fontSize={11} color="$red11" fontWeight="600">
                LIQUIDITY WARNING
              </Text>
            </XStack>
          )}
        </XStack>

        <Separator />

        {/* 1. Execution Progress */}
        <YStack space="$2">
          <XStack justifyContent="space-between">
            <Text fontSize="$3" color="$color11">
              Execution (Spent vs Planned)
            </Text>
            <Text fontSize="$3" fontWeight="bold">
              {formatBalance(executionMetrics.spent)}{" "}
              <Text color="$color8">/ {formatBalance(executionMetrics.budgeted)}</Text>
            </Text>
          </XStack>
          <Progress value={Math.min(executionMetrics.percent, 100)} size="$2">
            <Progress.Indicator animation="bouncy" bg={progressColor as any} />
          </Progress>
          <XStack justifyContent="flex-end">
            <Text fontSize={11} color={isOverSpent ? "$red10" : "$color10"}>
              {executionMetrics.percent.toFixed(0)}% Utilized {isOverSpent && "(Over Budget)"}
            </Text>
          </XStack>
        </YStack>

        {/* 2. Funding Insight */}
        {!fundingMetrics.isFunded && (
          <XStack bg="$red2" p="$2" borderRadius="$3" space="$2" alignItems="center">
            <Wallet size={16} color="$red10" />
            <Paragraph fontSize={12} color="$red11" flex={1}>
              Your Net Worth ({formatBalance(fundingMetrics.netWorth ?? 0)}) doesn't cover this plan
              ({formatBalance(fundingMetrics.required ?? 0)}). Shortfall:{" "}
              {formatBalance(Math.abs(fundingMetrics.diff ?? 0))}.
            </Paragraph>
          </XStack>
        )}
      </YStack>
    </GlassyCard>
  );
};
