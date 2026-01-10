import { useActivePlanId } from "@/lib/stores/use-active-plan-store";
import { useMemo } from "react";
import { useBalance } from "./use-balance";
import { usePlan } from "./use-plans";

export interface SystemHealth {
  score: number; // 0-100
  status: "HEALTHY" | "WARNING" | "CRITICAL";
  liquidityRatio: number;
  burnRatePacing: number;
  goalVelocity: number;
  fundingGap: number; // In major units (euros)
  dailyAllowance: number; // In major units
  insightMessages: string[];
  totalBudgeted: number;
  totalSpent: number;
  daysElapsed: number;
  daysTotal: number;
  isLoading: boolean;
}

export function useSystemHealth(): SystemHealth {
  const activePlanId = useActivePlanId();
  const { data: plan, isLoading: planLoading } = usePlan(activePlanId || "");
  const { data: balance, isLoading: balanceLoading } = useBalance();

  return useMemo(() => {
    if (planLoading || balanceLoading || !plan || !balance) {
      return {
        score: 0,
        status: "WARNING",
        liquidityRatio: 0,
        burnRatePacing: 0,
        goalVelocity: 0,
        fundingGap: 0,
        dailyAllowance: 0,
        insightMessages: [],
        totalBudgeted: 0,
        totalSpent: 0,
        daysElapsed: 0,
        daysTotal: 30,
        isLoading: true,
      };
    }

    const netWorth = balance.totalNetWorth;
    const totalExpenses = plan.totalExpenses; // Assuming this exists on plan object as per ActivePlanHeader usage

    // 1. Liquidity Ratio: Net Worth / Total Plan Expenses
    const liquidityRatio = totalExpenses > 0 ? netWorth / totalExpenses : 0;

    // 2. Funding Gap
    const fundingGap = netWorth - totalExpenses;

    // 3. Execution/Burn Rate (Simplified for client-side)
    // We need to sum up actual vs budgeted
    let totalBudgeted = 0;
    let totalSpent = 0;

    // Iterate all groups -> categories -> items
    if (plan.categoryGroups) {
      for (const group of plan.categoryGroups) {
        for (const category of group.categories) {
          for (const item of category.items) {
            if (item.itemType === "budget" || item.itemType === "recurring") {
              totalBudgeted += item.budgeted;
              totalSpent += item.actual;
            }
          }
        }
      }
    }

    // Burn Rate Pacing: (Current Spend / Planned Spend) vs Time Elapsed
    // Assuming 30 day month for simplicity or calculating based on current day
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const currentDay = now.getDate();
    const timeProgress = currentDay / daysInMonth; // 0.5 for mid-month

    const spendingProgress = totalBudgeted > 0 ? totalSpent / totalBudgeted : 0;

    // Ratio > 1 means spending faster than time. < 1 means spending slower.
    // Avoid division by zero
    const burnRatePacing = timeProgress > 0 ? spendingProgress / timeProgress : 1;

    // 4. Goal Velocity (Surplus / Goal Targets)
    // Need to find Goal Targets
    let totalGoalTargets = 0;
    let totalGoalSaved = 0;
    if (plan.categoryGroups) {
      for (const group of plan.categoryGroups) {
        for (const category of group.categories) {
          for (const item of category.items) {
            if (item.itemType === "goal") {
              totalGoalTargets += item.budgeted;
              totalGoalSaved += item.actual;
            }
          }
        }
      }
    }

    // Velocity: Are we funding goals?
    // Let's define Goal Velocity as: (Net Worth Surplus / Total Goal Targets)
    // If we have surplus after expenses, can we cover goals?
    // OR: Actual Saved / Target Saved (Execution of goals)
    // The doc says "Surplus Remaining / Total Monthly Goal Targets"
    const surplus = Math.max(0, fundingGap);
    const goalVelocity =
      totalGoalTargets > 0 ? surplus / totalGoalTargets : totalGoalSaved > 0 ? 1 : 0;

    // 5. Daily Allowance
    // (Remaining Budget - Remaining Recurring) / Days Left
    // Simplified: (Total Budget - Total Spent) / Days Left
    const daysLeft = Math.max(1, daysInMonth - currentDay);
    const remainingBudget = Math.max(0, totalBudgeted - totalSpent);
    const dailyAllowance = remainingBudget / daysLeft;

    // SCORING LOGIC (0-100)
    // Liquidity (40pts): Ratio >= 1.0 -> 40pts
    let liquidityScore = Math.min(liquidityRatio, 1.0) * 40;

    // Pacing (30pts): Burn Rate close to 1.0 is good. > 1.2 bad.
    // If pacing <= 1.0: Full 30pts
    // If pacing > 1.0: Decrease score. at 1.5 -> 0pts
    let pacingScore = 30;
    if (burnRatePacing > 1.0) {
      const penalty = (burnRatePacing - 1.0) * 60; // 0.5 over * 60 = 30 penalty
      pacingScore = Math.max(0, 30 - penalty);
    }

    // Goal Capacity (30pts):
    let goalScore = Math.min(goalVelocity, 1.0) * 30;

    const totalScore = Math.round(liquidityScore + pacingScore + goalScore);

    let status: "HEALTHY" | "WARNING" | "CRITICAL" = "HEALTHY";
    if (totalScore < 60) status = "CRITICAL";
    else if (totalScore < 90) status = "WARNING";

    // Insights
    const messages: string[] = [];
    if (liquidityRatio < 1.0)
      messages.push(`Your plan exceeds current liquidity by €${Math.abs(fundingGap).toFixed(0)}.`);
    if (burnRatePacing > 1.2)
      messages.push("You're spending significantly faster than the calendar.");
    if (totalScore > 90) messages.push("Systems optimal. You're on track!");

    return {
      score: totalScore,
      status,
      liquidityRatio,
      burnRatePacing,
      goalVelocity,
      fundingGap,
      dailyAllowance,
      insightMessages: messages,
      totalBudgeted,
      totalSpent,
      daysElapsed: currentDay,
      daysTotal: daysInMonth,
      isLoading: false,
    };
  }, [plan, balance, planLoading, balanceLoading]);
}
