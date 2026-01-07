/**
 * Tests for auth-store - Zustand auth state management
 */

import { act, renderHook } from "@testing-library/react-native";

// Mock the token storage module
jest.mock("@/lib/storage/token-storage", () => ({
  clearAllAuthState: jest.fn().mockResolvedValue(undefined),
  getAccessToken: jest.fn().mockResolvedValue(null),
  storeTokens: jest.fn().mockResolvedValue(undefined),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn().mockResolvedValue(undefined),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

import { clearAllAuthState, getAccessToken, storeTokens } from "@/lib/storage/token-storage";

const mockedClearAllAuthState = clearAllAuthState as jest.MockedFunction<typeof clearAllAuthState>;
const mockedGetAccessToken = getAccessToken as jest.MockedFunction<typeof getAccessToken>;
const mockedStoreTokens = storeTokens as jest.MockedFunction<typeof storeTokens>;

// Import after mocks are set up
import { useAuthStore } from "../auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the Zustand store state before each test
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      hasCompletedOnboarding: false,
    });
  });

  describe("logout", () => {
    it("clears all auth state when logout is called", async () => {
      // Set up initial authenticated state
      useAuthStore.setState({
        user: { id: "user-123", email: "test@example.com", username: "testuser" },
        isAuthenticated: true,
        isHydrated: true,
        hasCompletedOnboarding: true,
      });

      const { result } = renderHook(() => useAuthStore());

      // Verify initial state
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).not.toBeNull();
      expect(result.current.hasCompletedOnboarding).toBe(true);

      // Call logout
      await act(async () => {
        await result.current.logout();
      });

      // Verify clearAllAuthState was called
      expect(mockedClearAllAuthState).toHaveBeenCalledTimes(1);

      // Verify state is cleared
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.hasCompletedOnboarding).toBe(false);
    });

    it("handles logout error gracefully", async () => {
      mockedClearAllAuthState.mockRejectedValueOnce(new Error("Storage error"));

      useAuthStore.setState({
        user: { id: "user-123", email: "test@example.com", username: "testuser" },
        isAuthenticated: true,
        isHydrated: true,
      });

      const { result } = renderHook(() => useAuthStore());

      // Logout should not throw even if storage fails
      await expect(
        act(async () => {
          await result.current.logout();
        }),
      ).rejects.toThrow("Storage error");

      // State should still be updated even on storage error
      expect(mockedClearAllAuthState).toHaveBeenCalled();
    });
  });

  describe("loginSuccess", () => {
    it("stores tokens and sets user on successful login", async () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = {
        id: "user-456",
        email: "new@example.com",
        username: "newuser",
        displayName: "New User",
      };

      const mockTokens = {
        accessToken: "access-token-xyz",
        refreshToken: "refresh-token-xyz",
        expiresAt: "2024-12-31T23:59:59Z",
      };

      await act(async () => {
        await result.current.loginSuccess(mockUser, mockTokens);
      });

      // Verify storeTokens was called with correct params
      expect(mockedStoreTokens).toHaveBeenCalledWith(
        mockTokens.accessToken,
        mockTokens.refreshToken,
        mockTokens.expiresAt,
      );

      // Verify state is updated
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe("checkAuth", () => {
    it("returns true and sets authenticated when token exists", async () => {
      mockedGetAccessToken.mockResolvedValueOnce("valid-token");

      const { result } = renderHook(() => useAuthStore());

      let isAuth = false;
      await act(async () => {
        isAuth = await result.current.checkAuth();
      });

      expect(isAuth).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it("returns false and clears auth when no token exists", async () => {
      mockedGetAccessToken.mockResolvedValueOnce(null);

      useAuthStore.setState({ isAuthenticated: true });

      const { result } = renderHook(() => useAuthStore());

      let isAuth = true;
      await act(async () => {
        isAuth = await result.current.checkAuth();
      });

      expect(isAuth).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe("completeOnboarding", () => {
    it("sets hasCompletedOnboarding to true", () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.hasCompletedOnboarding).toBe(false);

      act(() => {
        result.current.completeOnboarding();
      });

      expect(result.current.hasCompletedOnboarding).toBe(true);
    });
  });

  describe("setters", () => {
    it("setUser updates user state", () => {
      const { result } = renderHook(() => useAuthStore());

      const mockUser = { id: "u1", email: "a@b.com", username: "ab" };

      act(() => {
        result.current.setUser(mockUser);
      });

      expect(result.current.user).toEqual(mockUser);
    });

    it("setAuthenticated updates auth state", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setAuthenticated(true);
      });

      expect(result.current.isAuthenticated).toBe(true);

      act(() => {
        result.current.setAuthenticated(false);
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it("setHydrated updates hydration state", () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setHydrated(true);
      });

      expect(result.current.isHydrated).toBe(true);
    });
  });
});
