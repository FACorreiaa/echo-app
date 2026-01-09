/**
 * Auth Hooks - React Query mutations and queries for authentication
 */

import * as authApi from "@/lib/api/auth";
import { queryKeys } from "@/lib/query/query-client";
import { clearTokens, getRefreshToken } from "@/lib/storage/token-storage";
import { useAuthStore, type AuthTokens, type User } from "@/lib/stores/auth-store";
import { timestampDate } from "@bufbuild/protobuf/wkt";
import { CommonActions, useNavigation } from "@react-navigation/native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";

// Helper to extract user from response
function extractUser(response: authApi.AuthResponse | authApi.GetMeResponse): User | null {
  const user = "user" in response ? response.user : null;
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
  };
}

// Helper to extract tokens from response
function extractTokens(response: authApi.AuthResponse): AuthTokens | null {
  const tokens = response.tokens;
  if (!tokens) return null;
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.accessTokenExpiresAt
      ? timestampDate(tokens.accessTokenExpiresAt).toISOString()
      : undefined,
  };
}

/**
 * Login mutation hook
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      // Clear any existing tokens to avoid sending stale auth headers
      await clearTokens();

      const response = await authApi.login(email, password);
      const user = extractUser(response);
      const tokens = extractTokens(response);

      if (!user || !tokens) {
        throw new Error("Invalid response from server");
      }

      return { user, tokens };
    },
    onSuccess: async ({ user, tokens }) => {
      await loginSuccess(user, tokens);
      // Invalidate user query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      // Check if onboarding completed - existing users go to tabs, new users to onboarding
      const hasCompletedOnboarding = useAuthStore.getState().hasCompletedOnboarding;
      if (hasCompletedOnboarding) {
        router.replace("/(tabs)");
      } else {
        router.replace("/(onboarding)");
      }
    },
  });
}

/**
 * Register mutation hook
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const router = useRouter();

  return useMutation({
    mutationFn: async ({
      email,
      password,
      username,
    }: {
      email: string;
      password: string;
      username?: string;
    }) => {
      // Clear any existing tokens to avoid sending stale auth headers
      await clearTokens();

      const response = await authApi.register(email, password, username);
      const user = extractUser(response);
      const tokens = extractTokens(response);

      if (!user || !tokens) {
        throw new Error("Invalid response from server");
      }

      return { user, tokens };
    },
    onSuccess: async ({ user, tokens }) => {
      // IMPORTANT: Reset onboarding for NEW users (they haven't completed it yet)
      useAuthStore.getState().setHasCompletedOnboarding(false);
      await loginSuccess(user, tokens);
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
      // New users always go to onboarding
      router.replace("/(onboarding)");
    },
  });
}
/**
 * Logout mutation hook
 * Implements three-layer secure logout:
 * 1. Storage wipe (tokens)
 * 2. State reset (Zustand + React Query)
 * 3. Navigation stack reset (prevents back-button access)
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);
  const navigation = useNavigation();

  return useMutation({
    mutationFn: async () => {
      console.log("[LOGOUT] Starting logout process...");
      // === LAYER 1: Storage Wipe ===
      // Clear tokens first (handled inside logout())
      await logout();
      console.log("[LOGOUT] Storage cleared");

      // === LAYER 2: State Reset ===
      // Clear all cached queries (financial data, user info, etc.)
      queryClient.clear();
      console.log("[LOGOUT] Query cache cleared");

      // === LAYER 3: Server-side revocation (fire-and-forget) ===
      const refreshToken = await getRefreshToken();
      if (refreshToken) {
        authApi.logout(refreshToken).catch(() => {
          // Silently ignore - user is already logged out locally
        });
      }
    },
    onSuccess: () => {
      console.log("[LOGOUT] Success - resetting navigation stack");
      // === LAYER 3: Navigation Stack Reset ===
      // CommonActions.reset wipes the entire navigation stack
      // This prevents back-button from revealing financial data
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "(auth)" }],
        }),
      );
    },
    onError: (error) => {
      console.error("[LOGOUT] Error:", error);
      // Even on error, ensure navigation happens
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "(auth)" }],
        }),
      );
    },
  });
}

/**
 * Current user query hook
 * Fetches user info from the server
 */
export function useCurrentUser() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: async () => {
      const response = await authApi.getMe();
      const user = extractUser(response);
      if (user) {
        setUser(user);
      }
      return user;
    },
    // Only fetch if authenticated
    enabled: isAuthenticated,
    // Keep user data fresh
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Token refresh mutation hook
 */
export function useRefreshToken() {
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token");
      }

      const response = await authApi.refresh(refreshToken);
      const user = extractUser(response);
      const tokens = extractTokens(response);

      if (!user || !tokens) {
        throw new Error("Invalid response from server");
      }

      return { user, tokens };
    },
    onSuccess: async ({ user, tokens }) => {
      await loginSuccess(user, tokens);
    },
    onError: async () => {
      // If refresh fails, log out
      await logout();
    },
  });
}
