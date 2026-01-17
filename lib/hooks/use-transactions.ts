/**
 * useTransactions - React Query hooks for transactions
 */

import { financeClient } from "@/lib/api/client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  importJobId?: string; // Filter by import batch (for staging view)
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

const PAGE_SIZE = 50;

/**
 * Infinite query for transactions with filtering
 */
export function useTransactions(filters?: TransactionFilters) {
  return useInfiniteQuery({
    queryKey: ["transactions", filters],
    queryFn: async ({ pageParam = "" }) => {
      const response = await financeClient.listTransactions({
        page: {
          pageSize: PAGE_SIZE,
          pageToken: pageParam,
        },
        accountId: filters?.accountId,
        categoryId: filters?.categoryId,
        importJobId: filters?.importJobId,
        timeRange:
          filters?.startDate && filters?.endDate
            ? {
                startTime: {
                  seconds: BigInt(Math.floor(filters.startDate.getTime() / 1000)),
                  nanos: 0,
                },
                endTime: {
                  seconds: BigInt(Math.floor(filters.endDate.getTime() / 1000)),
                  nanos: 0,
                },
              }
            : undefined,
      });

      return {
        transactions: response.transactions,
        nextPageToken: response.page?.nextPageToken ?? null,
      };
    },
    initialPageParam: "",
    getNextPageParam: (lastPage) => lastPage.nextPageToken || undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes - transactions don't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
    refetchOnMount: false, // Don't refetch if data is fresh
  });
}

/**
 * Flatten transactions from all pages
 */
export function useFlatTransactions(filters?: TransactionFilters) {
  const query = useTransactions(filters);

  const transactions = query.data?.pages.flatMap((page) => page.transactions) ?? [];

  return {
    ...query,
    transactions,
  };
}

/**
 * Invalidate transactions cache (after import or delete)
 */
export function useInvalidateTransactions() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["transactions"] });
}

/**
 * Delete all transactions from an import batch
 */
export function useDeleteImportBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (importJobId: string) => {
      const response = await financeClient.deleteImportBatch({ importJobId });
      return response;
    },
    onSuccess: () => {
      // Invalidate transactions cache after deletion
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/**
 * Simple interface for recent activity display
 */
export interface RecentTransaction {
  id: string;
  name: string;
  amount: number; // Minor units (cents)
  date: Date;
  emoji: string;
  categoryName?: string;
}

/**
 * Get category emoji based on category name
 */
function getCategoryEmoji(categoryName?: string): string {
  if (!categoryName) return "💰";
  const name = categoryName.toLowerCase();
  if (name.includes("food") || name.includes("restaurant") || name.includes("grocery")) return "🍕";
  if (name.includes("transport") || name.includes("travel") || name.includes("uber")) return "🚗";
  if (name.includes("entertainment") || name.includes("streaming")) return "📺";
  if (name.includes("shop") || name.includes("retail")) return "🛒";
  if (name.includes("health") || name.includes("pharmacy")) return "💊";
  if (name.includes("coffee") || name.includes("cafe")) return "☕";
  if (name.includes("bill") || name.includes("utility")) return "📄";
  if (name.includes("income") || name.includes("salary")) return "💵";
  return "💰";
}

/**
 * Fetch recent transactions for home screen
 */
export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: ["recent-transactions", limit],
    queryFn: async (): Promise<RecentTransaction[]> => {
      const response = await financeClient.listTransactions({
        page: { pageSize: limit, pageToken: "" },
      });

      return (response.transactions ?? []).map((tx) => {
        const postedAt = tx.postedAt ? new Date(Number(tx.postedAt.seconds) * 1000) : new Date();

        // Transaction has amount from Money message which has amountMinor field
        const amountMinor = tx.amount?.amountMinor ?? BigInt(0);

        return {
          id: tx.id ?? "",
          name: tx.merchantName || tx.description || "Unknown",
          amount: Number(amountMinor),
          date: postedAt,
          emoji: getCategoryEmoji(tx.merchantName ?? undefined),
          categoryName: undefined, // Category name not in Transaction proto
        };
      });
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - recent data can be slightly stale
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnMount: false, // Don't refetch if data is fresh
  });
}
