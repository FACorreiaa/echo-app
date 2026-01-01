/**
 * useBalance - React Query hooks for user balance
 */

import { balanceClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export interface Money {
  amountMinor: bigint;
  currencyCode: string;
}

export interface AccountBalance {
  accountId: string;
  accountName: string;
  accountType: number;
  cashBalance?: Money;
  investmentBalance?: Money;
  change24h?: Money;
  lastActivity?: Date;
}

export interface BalanceData {
  totalNetWorth: number;
  safeToSpend: number;
  totalInvestments: number;
  upcomingBills: number;
  isEstimated: boolean;
  currencyCode: string;
  accounts: AccountBalance[];
}

export interface DailyBalance {
  date: Date;
  balance: number;
  change: number;
}

export interface BalanceHistory {
  history: DailyBalance[];
  highestBalance: number;
  lowestBalance: number;
  averageBalance: number;
  currencyCode: string;
}

/**
 * Convert minor units to major units (cents to dollars/euros)
 */
function toMajor(minor?: bigint): number {
  return Number(minor ?? BigInt(0)) / 100;
}

/**
 * Fetch current balance
 */
export function useBalance(accountId?: string) {
  return useQuery({
    queryKey: ["balance", accountId],
    queryFn: async (): Promise<BalanceData> => {
      const response = await balanceClient.getBalance({
        accountId: accountId ?? undefined,
      });

      const currencyCode = response.totalNetWorth?.currencyCode ?? "EUR";

      return {
        totalNetWorth: toMajor(response.totalNetWorth?.amountMinor),
        safeToSpend: toMajor(response.safeToSpend?.amountMinor),
        totalInvestments: toMajor(response.totalInvestments?.amountMinor),
        upcomingBills: toMajor(response.upcomingBills?.amountMinor),
        isEstimated: response.isEstimated ?? true,
        currencyCode,
        accounts: (response.balances ?? []).map((b) => ({
          accountId: b.accountId ?? "",
          accountName: b.accountName ?? "Unknown",
          accountType: b.accountType ?? 0,
          cashBalance: b.cashBalance
            ? {
                amountMinor: b.cashBalance.amountMinor ?? BigInt(0),
                currencyCode: b.cashBalance.currencyCode ?? currencyCode,
              }
            : undefined,
          investmentBalance: b.investmentBalance
            ? {
                amountMinor: b.investmentBalance.amountMinor ?? BigInt(0),
                currencyCode: b.investmentBalance.currencyCode ?? currencyCode,
              }
            : undefined,
          change24h: b.change24h
            ? {
                amountMinor: b.change24h.amountMinor ?? BigInt(0),
                currencyCode: b.change24h.currencyCode ?? currencyCode,
              }
            : undefined,
          lastActivity: b.lastActivity
            ? new Date(Number(b.lastActivity.seconds) * 1000)
            : undefined,
        })),
      };
    },
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Fetch balance history for charts
 */
export function useBalanceHistory(days = 30, accountId?: string) {
  return useQuery({
    queryKey: ["balance-history", days, accountId],
    queryFn: async (): Promise<BalanceHistory> => {
      const response = await balanceClient.getBalanceHistory({
        days,
        accountId: accountId ?? undefined,
      });

      const currencyCode = response.highestBalance?.currencyCode ?? "EUR";

      return {
        history: (response.history ?? []).map((d) => ({
          date: d.date ? new Date(Number(d.date.seconds) * 1000) : new Date(),
          balance: toMajor(d.balance?.amountMinor),
          change: toMajor(d.change?.amountMinor),
        })),
        highestBalance: toMajor(response.highestBalance?.amountMinor),
        lowestBalance: toMajor(response.lowestBalance?.amountMinor),
        averageBalance: toMajor(response.averageBalance?.amountMinor),
        currencyCode,
      };
    },
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Format currency for display
 */
export function formatBalance(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
