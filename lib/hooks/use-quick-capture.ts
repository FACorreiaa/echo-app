/**
 * useQuickCapture - Hook for Quick Capture manual transaction entry
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { financeClient } from "@/lib/api/client";

interface QuickCaptureResult {
  transaction: {
    id: string;
    description: string;
    amount: number;
  };
  parsedDescription: string;
  parsedAmountMinor: bigint;
  suggestedCategoryId?: string;
  budgetImpact?: string;
}

/**
 * Create a manual transaction from natural language input
 */
export function useQuickCapture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rawText: string): Promise<QuickCaptureResult> => {
      const response = await financeClient.createManualTransaction({
        rawText,
      });

      return {
        transaction: {
          id: response.transaction?.id ?? "",
          description: response.transaction?.description ?? "",
          amount: Number(response.transaction?.amount?.amountMinor ?? 0) / 100,
        },
        parsedDescription: response.parsedDescription,
        parsedAmountMinor: response.parsedAmountMinor,
        suggestedCategoryId: response.suggestedCategoryId,
        budgetImpact: response.budgetImpact,
      };
    },
    onSuccess: () => {
      // Invalidate transactions and insights queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["spendingPulse"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardBlocks"] });
    },
  });
}
