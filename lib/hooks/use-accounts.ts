/**
 * useAccounts - React Query hooks for user accounts with balance integration
 */

import { balanceClient, financeClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export interface Account {
  id: string;
  name: string;
  accountType: string;
  currency: string;
  balance: number; // In major units (dollars/euros)
  cashBalance: number; // Liquid cash in major units
  investmentBalance: number; // Investments in major units
  change24h: number; // 24h change in major units
  lastFour?: string;
  emoji: string;
  lastActivity?: Date;
}

/**
 * Get account emoji based on type
 */
function getAccountEmoji(accountType: string): string {
  switch (accountType.toLowerCase()) {
    case "checking":
      return "💳";
    case "savings":
      return "🏦";
    case "credit":
      return "💸";
    case "investment":
      return "📈";
    case "cash":
      return "💵";
    default:
      return "💰";
  }
}

/**
 * Map AccountType enum to string
 */
const typeMap: Record<number, string> = {
  0: "unspecified",
  1: "cash",
  2: "checking",
  3: "savings",
  4: "credit",
  5: "investment",
  6: "loan",
  7: "other",
};

/**
 * Convert minor units to major units (cents to dollars/euros)
 */
function toMajor(minor?: bigint): number {
  return Number(minor ?? BigInt(0)) / 100;
}

/**
 * Fetch user accounts with balance data from BalanceService
 */
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts-with-balance"],
    queryFn: async (): Promise<Account[]> => {
      // Fetch accounts and balances in parallel
      const [accountsResponse, balanceResponse] = await Promise.all([
        financeClient.listAccounts({}),
        balanceClient.getBalance({}),
      ]);

      // Create a map of account ID to balance data for quick lookup
      const balanceMap = new Map<
        string,
        {
          cashBalance: number;
          investmentBalance: number;
          change24h: number;
          lastActivity?: Date;
        }
      >();

      for (const bal of balanceResponse.balances ?? []) {
        if (bal.accountId) {
          balanceMap.set(bal.accountId, {
            cashBalance: toMajor(bal.cashBalance?.amountMinor),
            investmentBalance: toMajor(bal.investmentBalance?.amountMinor),
            change24h: toMajor(bal.change24h?.amountMinor),
            lastActivity: bal.lastActivity
              ? new Date(Number(bal.lastActivity.seconds) * 1000)
              : undefined,
          });
        }
      }

      return (accountsResponse.accounts ?? []).map((a) => {
        const accountType = typeMap[a.type ?? 0] ?? "checking";
        const balanceData = balanceMap.get(a.id ?? "");

        const cashBalance = balanceData?.cashBalance ?? 0;
        const investmentBalance = balanceData?.investmentBalance ?? 0;

        return {
          id: a.id ?? "",
          name: a.name ?? "Unknown Account",
          accountType,
          currency: a.currencyCode ?? "EUR",
          balance: cashBalance + investmentBalance, // Total balance
          cashBalance,
          investmentBalance,
          change24h: balanceData?.change24h ?? 0,
          lastFour: a.last4 ?? undefined,
          emoji: getAccountEmoji(accountType),
          lastActivity: balanceData?.lastActivity,
        };
      });
    },
    staleTime: 30_000, // 30 seconds (match balance staleTime)
  });
}

/**
 * Fetch accounts without balance data (faster, for lists/dropdowns)
 */
export function useAccountsBasic() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<
      Omit<Account, "cashBalance" | "investmentBalance" | "change24h" | "lastActivity">[]
    > => {
      const response = await financeClient.listAccounts({});

      return (response.accounts ?? []).map((a) => {
        const accountType = typeMap[a.type ?? 0] ?? "checking";

        return {
          id: a.id ?? "",
          name: a.name ?? "Unknown Account",
          accountType,
          currency: a.currencyCode ?? "EUR",
          balance: 0, // Use useAccounts() for balance data
          lastFour: a.last4 ?? undefined,
          emoji: getAccountEmoji(accountType),
        };
      });
    },
    staleTime: 60_000, // 1 minute
  });
}

/**
 * Get total balance across all accounts
 */
export function useTotalBalance() {
  const { data: accounts = [], ...rest } = useAccounts();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCash = accounts.reduce((sum, acc) => sum + acc.cashBalance, 0);
  const totalInvestments = accounts.reduce((sum, acc) => sum + acc.investmentBalance, 0);
  const total24hChange = accounts.reduce((sum, acc) => sum + acc.change24h, 0);

  return {
    ...rest,
    totalBalance,
    totalCash,
    totalInvestments,
    total24hChange,
    accounts,
  };
}
