/**
 * API Configuration
 */

import { Platform } from "react-native";

// Base URL configuration
// In development: use localhost for web, machine IP for native
const getDefaultBaseUrl = (): string => {
  if (__DEV__) {
    // Web can use localhost
    if (Platform.OS === "web") {
      return "http://localhost:8069";
    }
    // iOS Simulator can use 127.0.0.1 (maps to host machine)
    // For physical devices, use your machine's local IP
    // Your current IP: 192.168.1.246
    return "http://127.0.0.1:8069";
  }
  // Production URL
  return "https://api.echoapp.com";
};

export const API_CONFIG = {
  baseUrl: getDefaultBaseUrl(),
  // Connect-RPC uses application/json for Connect protocol
  contentType: "application/json",
} as const;

/**
 * Update the base URL at runtime (useful for development)
 */
export function setApiBaseUrl(url: string): void {
  (API_CONFIG as { baseUrl: string }).baseUrl = url;
}
