/**
 * Active Plan Store - Global state for the currently active financial plan
 *
 * All tabs (Goals, Budgets, Recurring) read from this store to know which
 * plan's items to display. This ensures the entire app is "plan-centric".
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { UserPlan } from "@/lib/hooks/use-plans";

// ============================================================================
// Types
// ============================================================================

interface ActivePlanState {
  /** The ID of the currently active plan (persisted) */
  activePlanId: string | null;

  /** The full plan object (not persisted, fetched on demand) */
  activePlan: UserPlan | null;

  /** Set the active plan ID */
  setActivePlanId: (id: string | null) => void;

  /** Set the full active plan object */
  setActivePlan: (plan: UserPlan | null) => void;

  /** Clear the active plan (logout, etc.) */
  clearActivePlan: () => void;
}

// ============================================================================
// Store
// ============================================================================

export const useActivePlanStore = create<ActivePlanState>()(
  persist(
    (set) => ({
      activePlanId: null,
      activePlan: null,

      setActivePlanId: (id) =>
        set({
          activePlanId: id,
          // Clear the plan object when ID changes - it will be re-fetched
          activePlan: id ? undefined : null,
        } as Partial<ActivePlanState>),

      setActivePlan: (plan) =>
        set({
          activePlan: plan,
          activePlanId: plan?.id ?? null,
        }),

      clearActivePlan: () =>
        set({
          activePlanId: null,
          activePlan: null,
        }),
    }),
    {
      name: "echo-active-plan",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the ID, not the full plan object
      partialize: (state) => ({ activePlanId: state.activePlanId }),
    },
  ),
);

// ============================================================================
// Selectors (for convenience)
// ============================================================================

/** Get just the active plan ID */
export const useActivePlanId = () => useActivePlanStore((s) => s.activePlanId);

/** Get the full active plan object */
export const useActivePlan = () => useActivePlanStore((s) => s.activePlan);

/** Check if there is an active plan */
export const useHasActivePlan = () => useActivePlanStore((s) => !!s.activePlanId);
