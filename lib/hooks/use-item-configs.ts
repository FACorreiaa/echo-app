/**
 * useItemConfigs - React Query hooks for user-configurable item types
 *
 * These types (Budget, Recurring, Savings, Income, Investment, Debt)
 * are dynamically configurable per-user and determine which tab
 * displays each plan item.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Types (local until proto is regenerated)
// ============================================================================

export type ItemBehavior = "outflow" | "inflow" | "asset" | "liability";
export type TargetTab = "budgets" | "recurring" | "goals" | "income" | "portfolio" | "liabilities";

export interface ItemConfig {
  id: string;
  label: string; // "Budget", "Investment"
  shortCode: string; // "B", "I", "D"
  behavior: ItemBehavior;
  targetTab: TargetTab;
  colorHex: string;
  icon: string;
  isSystem: boolean;
  sortOrder: number;
}

// Default configs (used before API is available)
export const DEFAULT_ITEM_CONFIGS: ItemConfig[] = [
  {
    id: "1",
    label: "Budget",
    shortCode: "B",
    behavior: "outflow",
    targetTab: "budgets",
    colorHex: "#22c55e",
    icon: "wallet",
    isSystem: true,
    sortOrder: 1,
  },
  {
    id: "2",
    label: "Recurring",
    shortCode: "R",
    behavior: "outflow",
    targetTab: "recurring",
    colorHex: "#f59e0b",
    icon: "repeat",
    isSystem: true,
    sortOrder: 2,
  },
  {
    id: "3",
    label: "Savings Goal",
    shortCode: "S",
    behavior: "outflow",
    targetTab: "goals",
    colorHex: "#6366f1",
    icon: "target",
    isSystem: true,
    sortOrder: 3,
  },
  {
    id: "4",
    label: "Income",
    shortCode: "IN",
    behavior: "inflow",
    targetTab: "income",
    colorHex: "#14b8a6",
    icon: "trending-up",
    isSystem: true,
    sortOrder: 4,
  },
  {
    id: "5",
    label: "Investment",
    shortCode: "I",
    behavior: "asset",
    targetTab: "portfolio",
    colorHex: "#8b5cf6",
    icon: "bar-chart-2",
    isSystem: true,
    sortOrder: 5,
  },
  {
    id: "6",
    label: "Debt",
    shortCode: "D",
    behavior: "liability",
    targetTab: "liabilities",
    colorHex: "#ef4444",
    icon: "credit-card",
    isSystem: true,
    sortOrder: 6,
  },
];

// ============================================================================
// Queries
// ============================================================================

/**
 * List all item configs for the current user
 */
export function useItemConfigs() {
  return useQuery({
    queryKey: ["item-configs"],
    queryFn: async () => {
      try {
        // TODO: Uncomment when proto is regenerated
        // const response = await planClient.listItemConfigs({});
        // return response.configs.map(mapConfigFromProto);

        // Return defaults for now
        return DEFAULT_ITEM_CONFIGS;
      } catch {
        // Fallback to defaults if API fails
        return DEFAULT_ITEM_CONFIGS;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes - configs don't change often
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new custom item config
 */
export function useCreateItemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      label: string;
      shortCode: string;
      behavior: ItemBehavior;
      targetTab: TargetTab;
      colorHex: string;
      icon: string;
    }) => {
      // TODO: Uncomment when proto is regenerated
      // const response = await planClient.createItemConfig({
      //   label: input.label,
      //   shortCode: input.shortCode,
      //   behavior: toProtoBehavior(input.behavior),
      //   targetTab: toProtoTargetTab(input.targetTab),
      //   colorHex: input.colorHex,
      //   icon: input.icon,
      // });
      // return mapConfigFromProto(response.config);

      // Mock for now
      const newConfig: ItemConfig = {
        id: Date.now().toString(),
        ...input,
        isSystem: false,
        sortOrder: 100,
      };
      return newConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-configs"] });
    },
  });
}

/**
 * Update an existing item config
 */
export function useUpdateItemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: string;
      label?: string;
      shortCode?: string;
      behavior?: ItemBehavior;
      targetTab?: TargetTab;
      colorHex?: string;
      icon?: string;
      sortOrder?: number;
    }) => {
      // TODO: Uncomment when proto is regenerated
      // const response = await planClient.updateItemConfig({
      //   id: input.id,
      //   ...input,
      // });
      // return mapConfigFromProto(response.config);

      return input as ItemConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-configs"] });
    },
  });
}

/**
 * Delete a custom item config
 */
export function useDeleteItemConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (_configId: string) => {
      // TODO: Uncomment when proto is regenerated
      // await planClient.deleteItemConfig({ id: _configId });
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-configs"] });
    },
  });
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get the color for a given behavior type
 */
export function getBehaviorColor(behavior: ItemBehavior): string {
  switch (behavior) {
    case "outflow":
      return "#ef4444"; // red - expenses
    case "inflow":
      return "#22c55e"; // green - income
    case "asset":
      return "#8b5cf6"; // purple - investments
    case "liability":
      return "#f59e0b"; // orange - debts
    default:
      return "#6b7280"; // gray
  }
}

/**
 * Get human-readable label for behavior
 */
export function getBehaviorLabel(behavior: ItemBehavior): string {
  switch (behavior) {
    case "outflow":
      return "Expense";
    case "inflow":
      return "Income";
    case "asset":
      return "Asset";
    case "liability":
      return "Liability";
    default:
      return "Unknown";
  }
}

/**
 * Get human-readable label for target tab
 */
export function getTargetTabLabel(tab: TargetTab): string {
  switch (tab) {
    case "budgets":
      return "Budgets";
    case "recurring":
      return "Recurring";
    case "goals":
      return "Goals";
    case "income":
      return "Income";
    case "portfolio":
      return "Portfolio";
    case "liabilities":
      return "Liabilities";
    default:
      return "Unknown";
  }
}
