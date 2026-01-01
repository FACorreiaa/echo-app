/**
 * useAccounts - React Query hook for user accounts
 */

import { financeClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export interface Account {
  id: string;
  name: string;
  accountType: string;
  currency: string;
  balance: number; // In minor units (cents)
  lastFour?: string;
  emoji: string;
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
 * Fetch user accounts
 */
export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
      const response = await financeClient.listAccounts({});

      return (response.accounts ?? []).map((a) => {
        // Map AccountType enum to string
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
        const accountType = typeMap[a.type ?? 0] ?? "checking";

        return {
          id: a.id ?? "",
          name: a.name ?? "Unknown Account",
          accountType,
          currency: a.currencyCode ?? "EUR",
          balance: 0, // Balance not exposed in proto, would need separate endpoint
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

  return {
    ...rest,
    totalBalance,
    accounts,
  };
}
