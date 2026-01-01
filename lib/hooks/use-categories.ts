/**
 * useCategories - Hook to fetch user categories
 */

import { financeClient } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

/**
 * Fetch all categories for the user
 */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const response = await financeClient.listCategories({});

      return (response.categories ?? []).map((c) => ({
        id: c.id ?? "",
        name: c.name ?? "Uncategorized",
        icon: c.icon ?? undefined,
        color: c.color ?? undefined,
      }));
    },
    staleTime: 5 * 60_000, // 5 minutes - categories don't change often
  });
}
