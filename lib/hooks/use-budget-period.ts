/**
 * useBudgetPeriod - React Query hooks for monthly budget periods
 *
 * Provides month-by-month budget versioning with:
 * - Get/create period for specific month
 * - Update item values per period
 * - Copy values from one month to another
 */

import { planClient } from "@/lib/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

export interface BudgetPeriodItem {
  id: string;
  periodId: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  budgetedMinor: bigint;
  actualMinor: bigint;
  notes?: string;
}

export interface BudgetPeriod {
  id: string;
  planId: string;
  year: number;
  month: number;
  isLocked: boolean;
  notes?: string;
  items: BudgetPeriodItem[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Query Keys
// ============================================================================

const budgetPeriodKeys = {
  all: ["budget-periods"] as const,
  byPlan: (planId: string) => [...budgetPeriodKeys.all, "plan", planId] as const,
  period: (planId: string, year: number, month: number) =>
    [...budgetPeriodKeys.byPlan(planId), year, month] as const,
};

// ============================================================================
// Hooks
// ============================================================================

/**
 * Get or create a budget period for a specific month
 */
export function useBudgetPeriod(planId: string, year: number, month: number) {
  return useQuery({
    queryKey: budgetPeriodKeys.period(planId, year, month),
    queryFn: async (): Promise<{ period: BudgetPeriod; wasCreated: boolean }> => {
      const response = await planClient.getBudgetPeriod({
        planId,
        year,
        month,
      });

      const period = response.period;
      if (!period) {
        throw new Error("No period returned");
      }

      return {
        period: {
          id: period.id,
          planId: period.planId,
          year: period.year,
          month: period.month,
          isLocked: period.isLocked,
          notes: period.notes || undefined,
          items: period.items.map((item) => ({
            id: item.id,
            periodId: item.periodId,
            itemId: item.itemId,
            itemName: item.itemName,
            categoryName: item.categoryName,
            budgetedMinor: item.budgetedMinor,
            actualMinor: item.actualMinor,
            notes: item.notes || undefined,
          })),
          createdAt: period.createdAt?.toDate() ?? new Date(),
          updatedAt: period.updatedAt?.toDate() ?? new Date(),
        },
        wasCreated: response.wasCreated,
      };
    },
    enabled: !!planId && year > 0 && month >= 1 && month <= 12,
  });
}

/**
 * List all budget periods for a plan
 */
export function useBudgetPeriods(planId: string) {
  return useQuery({
    queryKey: budgetPeriodKeys.byPlan(planId),
    queryFn: async (): Promise<BudgetPeriod[]> => {
      const response = await planClient.listBudgetPeriods({ planId });

      return response.periods.map((period) => ({
        id: period.id,
        planId: period.planId,
        year: period.year,
        month: period.month,
        isLocked: period.isLocked,
        notes: period.notes || undefined,
        items: period.items.map((item) => ({
          id: item.id,
          periodId: item.periodId,
          itemId: item.itemId,
          itemName: item.itemName,
          categoryName: item.categoryName,
          budgetedMinor: item.budgetedMinor,
          actualMinor: item.actualMinor,
          notes: item.notes || undefined,
        })),
        createdAt: period.createdAt?.toDate() ?? new Date(),
        updatedAt: period.updatedAt?.toDate() ?? new Date(),
      }));
    },
    enabled: !!planId,
  });
}

/**
 * Update a budget period item's values
 */
export function useUpdateBudgetPeriodItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      periodItemId: string;
      budgetedMinor?: bigint;
      actualMinor?: bigint;
      notes?: string;
    }) => {
      const response = await planClient.updateBudgetPeriodItem({
        periodItemId: input.periodItemId,
        budgetedMinor: input.budgetedMinor,
        actualMinor: input.actualMinor,
        notes: input.notes,
      });
      return response.item;
    },
    onSuccess: () => {
      // Invalidate all budget period queries to refresh
      queryClient.invalidateQueries({ queryKey: budgetPeriodKeys.all });
    },
  });
}

/**
 * Copy budget values from one month to another
 * This is the "smart duplicate" functionality
 */
export function useCopyBudgetPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      sourcePeriodId: string;
      targetPlanId: string;
      targetYear: number;
      targetMonth: number;
    }) => {
      const response = await planClient.copyBudgetPeriod({
        sourcePeriodId: input.sourcePeriodId,
        targetPlanId: input.targetPlanId,
        targetYear: input.targetYear,
        targetMonth: input.targetMonth,
      });

      const period = response.period;
      if (!period) {
        throw new Error("No period returned");
      }

      return {
        id: period.id,
        planId: period.planId,
        year: period.year,
        month: period.month,
        isLocked: period.isLocked,
        notes: period.notes || undefined,
        items: period.items.map((item) => ({
          id: item.id,
          periodId: item.periodId,
          itemId: item.itemId,
          itemName: item.itemName,
          categoryName: item.categoryName,
          budgetedMinor: item.budgetedMinor,
          actualMinor: item.actualMinor,
          notes: item.notes || undefined,
        })),
        createdAt: period.createdAt?.toDate() ?? new Date(),
        updatedAt: period.updatedAt?.toDate() ?? new Date(),
      } as BudgetPeriod;
    },
    onSuccess: (_data, variables) => {
      // Invalidate target period queries
      queryClient.invalidateQueries({
        queryKey: budgetPeriodKeys.period(
          variables.targetPlanId,
          variables.targetYear,
          variables.targetMonth,
        ),
      });
      queryClient.invalidateQueries({
        queryKey: budgetPeriodKeys.byPlan(variables.targetPlanId),
      });
    },
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get month name from number
 */
export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month - 1] ?? "Unknown";
}

/**
 * Get next month (year, month)
 */
export function getNextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

/**
 * Get previous month (year, month)
 */
export function getPreviousMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

/**
 * Format money from minor units
 */
export function formatPeriodMoney(minorUnits: bigint, currencyCode = "EUR"): string {
  const major = Number(minorUnits) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(major);
}
