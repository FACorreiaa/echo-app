/**
 * Token Storage
 * Platform-aware secure storage for auth tokens
 * - Native (iOS/Android): expo-secure-store
 * - Web: AsyncStorage (less secure, but functional)
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const KEYS = {
  ACCESS_TOKEN: "echo_access_token",
  REFRESH_TOKEN: "echo_refresh_token",
  TOKEN_EXPIRY: "echo_token_expiry",
} as const;

// Check if we can use SecureStore (native only)
const useSecureStore = Platform.OS !== "web";

/**
 * Store a value securely
 */
async function setItem(key: string, value: string): Promise<void> {
  if (useSecureStore) {
    await SecureStore.setItemAsync(key, value);
  } else {
    await AsyncStorage.setItem(key, value);
  }
}

/**
 * Get a value from secure storage
 */
async function getItem(key: string): Promise<string | null> {
  if (useSecureStore) {
    return SecureStore.getItemAsync(key);
  } else {
    return AsyncStorage.getItem(key);
  }
}

/**
 * Remove a value from secure storage
 */
async function removeItem(key: string): Promise<void> {
  if (useSecureStore) {
    await SecureStore.deleteItemAsync(key);
  } else {
    await AsyncStorage.removeItem(key);
  }
}

// ============ Token-specific functions ============

/**
 * Store auth tokens
 */
export async function storeTokens(
  accessToken: string,
  refreshToken: string,
  expiresAt?: string,
): Promise<void> {
  await Promise.all([
    setItem(KEYS.ACCESS_TOKEN, accessToken),
    setItem(KEYS.REFRESH_TOKEN, refreshToken),
    expiresAt ? setItem(KEYS.TOKEN_EXPIRY, expiresAt) : Promise.resolve(),
  ]);
}

/**
 * Get access token
 */
export async function getAccessToken(): Promise<string | null> {
  return getItem(KEYS.ACCESS_TOKEN);
}

/**
 * Get refresh token
 */
export async function getRefreshToken(): Promise<string | null> {
  return getItem(KEYS.REFRESH_TOKEN);
}

/**
 * Get token expiry time
 */
export async function getTokenExpiry(): Promise<Date | null> {
  const expiry = await getItem(KEYS.TOKEN_EXPIRY);
  return expiry ? new Date(expiry) : null;
}

/**
 * Check if access token is expired (or will expire soon)
 * Returns true if expired or expiring within bufferMs
 */
export async function isTokenExpired(bufferMs: number = 60000): Promise<boolean> {
  const expiry = await getTokenExpiry();
  if (!expiry) return true;
  return expiry.getTime() - bufferMs < Date.now();
}

/**
 * Clear all stored tokens
 */
export async function clearTokens(): Promise<void> {
  await Promise.all([
    removeItem(KEYS.ACCESS_TOKEN),
    removeItem(KEYS.REFRESH_TOKEN),
    removeItem(KEYS.TOKEN_EXPIRY),
  ]);
}
