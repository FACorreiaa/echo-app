/**
 * usePlanItemsByTab - Query items from a plan filtered by target tab
 *
 * Used by Goals, Budgets, and Recurring tabs to show only relevant items
 * from the active plan.
 */

import { TargetTab } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/plan_pb";
import { useQuery } from "@tanstack/react-query";

import { planClient } from "@/lib/api/client";

// ============================================================================
// Types
// ============================================================================

export type TabType = "budgets" | "goals" | "recurring" | "income" | "portfolio" | "liabilities";

export interface PlanItemWithConfig {
  id: string;
  name: string;
  budgetedMinor: bigint;
  actualMinor: bigint;
  categoryName: string;
  groupName: string;
  configId: string;
  configLabel: string;
  configShortCode: string;
  configColorHex: string;
  behavior: "outflow" | "inflow" | "asset" | "liability" | "unspecified";
}

export interface ItemsByTabResult {
  items: PlanItemWithConfig[];
  totalBudgetedMinor: bigint;
  totalActualMinor: bigint;
}

// ============================================================================
// Helpers
// ============================================================================

function mapTabToProto(tab: TabType): TargetTab {
  switch (tab) {
    case "budgets":
      return TargetTab.BUDGETS;
    case "goals":
      return TargetTab.GOALS;
    case "recurring":
      return TargetTab.RECURRING;
    case "income":
      return TargetTab.INCOME;
    case "portfolio":
      return TargetTab.PORTFOLIO;
    case "liabilities":
      return TargetTab.LIABILITIES;
    default:
      return TargetTab.BUDGETS;
  }
}

function mapBehavior(
  behavior: number,
): "outflow" | "inflow" | "asset" | "liability" | "unspecified" {
  switch (behavior) {
    case 1:
      return "outflow";
    case 2:
      return "inflow";
    case 3:
      return "asset";
    case 4:
      return "liability";
    default:
      return "unspecified";
  }
}

// ============================================================================
// Query Keys
// ============================================================================

export const itemsByTabKeys = {
  all: ["items-by-tab"] as const,
  byTab: (planId: string, tab: TabType) => [...itemsByTabKeys.all, planId, tab] as const,
};

// ============================================================================
// Hook
// ============================================================================

/**
 * Fetch items from a plan filtered by target tab
 */
export function usePlanItemsByTab(planId: string | null, tab: TabType) {
  return useQuery({
    queryKey: itemsByTabKeys.byTab(planId ?? "", tab),
    queryFn: async (): Promise<ItemsByTabResult> => {
      if (!planId) {
        return { items: [], totalBudgetedMinor: 0n, totalActualMinor: 0n };
      }

      const response = await planClient.getPlanItemsByTab({
        planId,
        targetTab: mapTabToProto(tab),
      });

      const items: PlanItemWithConfig[] = (response.items ?? []).map((item) => ({
        id: item.id ?? "",
        name: item.name ?? "",
        budgetedMinor: item.budgeted?.amountMinor ?? 0n,
        actualMinor: item.actual?.amountMinor ?? 0n,
        categoryName: item.categoryName ?? "",
        groupName: item.groupName ?? "",
        configId: item.configId ?? "",
        configLabel: item.configLabel ?? "",
        configShortCode: item.configShortCode ?? "",
        configColorHex: item.configColorHex ?? "",
        behavior: mapBehavior(item.behavior ?? 0),
      }));

      return {
        items,
        totalBudgetedMinor: response.totalBudgeted?.amountMinor ?? 0n,
        totalActualMinor: response.totalActual?.amountMinor ?? 0n,
      };
    },
    enabled: !!planId,
    staleTime: 30_000,
  });
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Format money from minor units
 */
export function formatMoney(amountMinor: bigint, currency = "EUR"): string {
  const amount = Number(amountMinor) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculate progress percentage
 */
export function calcProgress(actual: bigint, budgeted: bigint): number {
  if (budgeted === 0n) return 0;
  return Math.min((Number(actual) / Number(budgeted)) * 100, 100);
}
