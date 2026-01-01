/**
 * useInsights - React Query hooks for spending pulse and dashboard blocks
 */

import { financeClient, insightsClient } from "@/lib/api/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Types for the responses
export interface SpendingPulse {
  currentMonthSpend: number;
  lastMonthSpend: number;
  spendDelta: number;
  pacePercent: number;
  isOverPace: boolean;
  paceMessage: string;
  dayOfMonth: number;
  transactionCount: number;
  asOfDate: Date;
  topCategories: TopCategorySpend[];
  surpriseExpenses: SurpriseExpense[];
}

export interface TopCategorySpend {
  categoryId?: string;
  categoryName: string;
  amount: number;
  transactionCount: number;
}

export interface SurpriseExpense {
  transactionId: string;
  description: string;
  merchantName: string;
  amount: number;
  postedAt: Date;
  categoryName?: string;
}

export interface DashboardBlock {
  type: string;
  title: string;
  subtitle: string;
  value: string;
  icon: string;
  color: string;
  action?: string;
}

export interface CategoryRule {
  id: string;
  userId: string;
  matchPattern: string;
  cleanName: string;
  categoryId?: string;
  isRecurring: boolean;
  priority: number;
}

/**
 * Fetch spending pulse data (current vs last month)
 */
export function useSpendingPulse(asOf?: Date) {
  return useQuery({
    queryKey: ["spending-pulse", asOf?.toISOString()],
    queryFn: async (): Promise<SpendingPulse> => {
      // Pass asOf as undefined if not provided - let server use current date
      const response = await insightsClient.getSpendingPulse({});
      const pulse = response.pulse;

      return {
        currentMonthSpend: Number(pulse?.currentMonthSpend?.amountMinor ?? 0) / 100,
        lastMonthSpend: Number(pulse?.lastMonthSpend?.amountMinor ?? 0) / 100,
        spendDelta: Number(pulse?.spendDelta?.amountMinor ?? 0) / 100,
        pacePercent: pulse?.pacePercent ?? 0,
        isOverPace: pulse?.isOverPace ?? false,
        paceMessage: pulse?.paceMessage ?? "",
        dayOfMonth: pulse?.dayOfMonth ?? 0,
        transactionCount: pulse?.transactionCount ?? 0,
        asOfDate: pulse?.asOfDate ? new Date(Number(pulse.asOfDate.seconds) * 1000) : new Date(),
        topCategories: (pulse?.topCategories ?? []).map((c) => ({
          categoryId: c.categoryId ?? undefined,
          categoryName: c.categoryName ?? "Uncategorized",
          amount: Number(c.amount?.amountMinor ?? 0) / 100,
          transactionCount: c.transactionCount ?? 0,
        })),
        surpriseExpenses: (pulse?.surpriseExpenses ?? []).map((e) => ({
          transactionId: e.transactionId ?? "",
          description: e.description ?? "",
          merchantName: e.merchantName ?? "",
          amount: Number(e.amount?.amountMinor ?? 0) / 100,
          postedAt: e.postedAt ? new Date(Number(e.postedAt.seconds) * 1000) : new Date(),
          categoryName: e.categoryName ?? undefined,
        })),
      };
    },
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Fetch dashboard blocks for bento grid
 */
export function useDashboardBlocks() {
  return useQuery({
    queryKey: ["dashboard-blocks"],
    queryFn: async (): Promise<DashboardBlock[]> => {
      const response = await insightsClient.getDashboardBlocks({});

      return (response.blocks ?? []).map((b) => ({
        type: b.type ?? "status",
        title: b.title ?? "",
        subtitle: b.subtitle ?? "",
        value: b.value ?? "",
        icon: b.icon ?? "",
        color: b.color ?? "gray",
        action: b.action ?? undefined,
      }));
    },
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Create a new categorization rule ("Remember this")
 */
export function useCreateCategoryRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      matchPattern: string;
      cleanName: string;
      categoryId?: string;
      isRecurring?: boolean;
      applyToExisting?: boolean;
    }) => {
      const response = await financeClient.createCategoryRule({
        matchPattern: params.matchPattern,
        cleanName: params.cleanName,
        categoryId: params.categoryId,
        isRecurring: params.isRecurring ?? false,
        applyToExisting: params.applyToExisting ?? false,
      });

      return {
        rule: response.rule,
        transactionsUpdated: Number(response.transactionsUpdated ?? 0),
      };
    },
    onSuccess: () => {
      // Invalidate related caches
      queryClient.invalidateQueries({ queryKey: ["category-rules"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["spending-pulse"] });
    },
  });
}

/**
 * List user's category rules
 */
export function useCategoryRules() {
  return useQuery({
    queryKey: ["category-rules"],
    queryFn: async (): Promise<CategoryRule[]> => {
      const response = await financeClient.listCategoryRules({});

      return (response.rules ?? []).map((r) => ({
        id: r.id ?? "",
        userId: r.userId ?? "",
        matchPattern: r.matchPattern ?? "",
        cleanName: r.cleanName ?? "",
        categoryId: r.categoryId ?? undefined,
        isRecurring: r.isRecurring ?? false,
        priority: r.priority ?? 0,
      }));
    },
    staleTime: 5 * 60_000, // 5 minutes
  });
}

// Alert types
export interface Alert {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  message: string;
  isRead: boolean;
  isDismissed: boolean;
  alertDate: Date;
  createdAt: Date;
}

/**
 * List user's alerts
 */
export function useAlerts(unreadOnly = true, limit = 20) {
  return useQuery({
    queryKey: ["alerts", unreadOnly, limit],
    queryFn: async (): Promise<Alert[]> => {
      const response = await insightsClient.listAlerts({
        unreadOnly,
        limit,
      });

      return (response.alerts ?? []).map((a) => ({
        id: a.id ?? "",
        alertType: String(a.alertType ?? "ALERT_TYPE_UNSPECIFIED"),
        severity: String(a.severity ?? "ALERT_SEVERITY_INFO"),
        title: a.title ?? "",
        message: a.message ?? "",
        isRead: a.isRead ?? false,
        isDismissed: a.isDismissed ?? false,
        alertDate: a.alertDate ? new Date(Number(a.alertDate.seconds) * 1000) : new Date(),
        createdAt: a.createdAt ? new Date(Number(a.createdAt.seconds) * 1000) : new Date(),
      }));
    },
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Mark alert as read
 */
export function useMarkAlertRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      await insightsClient.markAlertRead({ alertId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}

/**
 * Dismiss alert
 */
export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      await insightsClient.dismissAlert({ alertId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });
}
