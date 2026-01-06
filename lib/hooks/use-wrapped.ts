/**
 * useWrapped - React Query hooks for wrapped/highlights feature
 */

import { useQuery } from "@tanstack/react-query";

import { insightsClient } from "@/lib/api/client";

// Types for wrapped response
export interface WrappedCard {
  title: string;
  subtitle: string;
  body: string;
  accent: string;
}

export interface WrappedSummary {
  id: string;
  userId: string;
  period: "month" | "year";
  periodStart: Date;
  periodEnd: Date;
  cards: WrappedCard[];
  createdAt: Date;
}

/**
 * Fetch wrapped summary for a period
 */
export function useWrapped(
  period: "month" | "year" = "month",
  periodStart?: Date,
  periodEnd?: Date,
) {
  // Default to current month if not provided
  const now = new Date();
  const defaultStart = periodStart ?? new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultEnd = periodEnd ?? new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  return useQuery({
    queryKey: ["wrapped", period, defaultStart.toISOString(), defaultEnd.toISOString()],
    queryFn: async (): Promise<WrappedSummary> => {
      const response = await insightsClient.getWrapped({
        period: period === "year" ? 2 : 1, // 1 = MONTH, 2 = YEAR
        periodStart: {
          seconds: BigInt(Math.floor(defaultStart.getTime() / 1000)),
          nanos: 0,
        },
        periodEnd: {
          seconds: BigInt(Math.floor(defaultEnd.getTime() / 1000)),
          nanos: 0,
        },
      });

      const wrapped = response.wrapped;

      return {
        id: wrapped?.id ?? "",
        userId: wrapped?.userId ?? "",
        period: wrapped?.period === 2 ? "year" : "month",
        periodStart: wrapped?.periodStart
          ? new Date(Number(wrapped.periodStart.seconds) * 1000)
          : defaultStart,
        periodEnd: wrapped?.periodEnd
          ? new Date(Number(wrapped.periodEnd.seconds) * 1000)
          : defaultEnd,
        cards: (wrapped?.cards ?? []).map((c) => ({
          title: c.title ?? "",
          subtitle: c.subtitle ?? "",
          body: c.body ?? "",
          accent: c.accent ?? "#6366F1",
        })),
        createdAt: wrapped?.createdAt
          ? new Date(Number(wrapped.createdAt.seconds) * 1000)
          : new Date(),
      };
    },
    staleTime: 5 * 60_000, // 5 minutes
  });
}
