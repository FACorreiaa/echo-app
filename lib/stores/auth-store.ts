/**
 * Auth Store - Zustand with AsyncStorage persistence
 * Manages authentication state across app restarts
 */

import { clearTokens, getAccessToken, storeTokens } from "@/lib/storage/token-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
// Use CJS to avoid bundling import.meta in the web build.
const { createJSONStorage, persist } = require("zustand/middleware");

// User type
export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
}

// Auth tokens (stored separately in secure storage)
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
}

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (value: boolean) => void;
  setHydrated: (value: boolean) => void;

  // Auth actions
  loginSuccess: (user: User, tokens: AuthTokens) => Promise<void>;
  logout: () => Promise<void>;

  // Hydration helper
  checkAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, _) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isHydrated: false,

      // Setters
      setUser: (user) => set({ user }),
      setAuthenticated: (value) => set({ isAuthenticated: value }),
      setHydrated: (value) => set({ isHydrated: value }),

      // Login success - store user and tokens
      loginSuccess: async (user, tokens) => {
        await storeTokens(tokens.accessToken, tokens.refreshToken, tokens.expiresAt);
        set({ user, isAuthenticated: true });
      },

      // Logout - clear everything
      logout: async () => {
        await clearTokens();
        set({ user: null, isAuthenticated: false });
      },

      // Check if user is authenticated (on app start)
      checkAuth: async () => {
        const token = await getAccessToken();
        if (token) {
          set({ isAuthenticated: true });
          return true;
        }
        set({ isAuthenticated: false });
        return false;
      },
    }),
    {
      name: "echo-auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist user data, not tokens (they go to SecureStore)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state, error) => {
        // Mark as hydrated after rehydration completes
        // Note: state can be undefined on first run (no stored data)
        if (state) {
          state.setHydrated(true);
        } else {
          // First run or hydration error - still need to mark as hydrated
          useAuthStore.getState().setHydrated(true);
        }
        if (error) {
          console.warn("Auth store hydration error:", error);
        }
      },
    },
  ),
);

// Selector hooks for common use cases
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsHydrated = () => useAuthStore((state) => state.isHydrated);
