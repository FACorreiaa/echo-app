/**
 * API Configuration
 */

import { Platform } from "react-native";

// Base URL configuration
// In development: use localhost for web, device IP for native
const getDefaultBaseUrl = (): string => {
  if (__DEV__) {
    // Web can use localhost
    if (Platform.OS === "web") {
      return "http://localhost:8069";
    }
    // Native simulators/devices need the host machine's IP
    // You may need to update this for your network
    return "http://192.168.1.100:8080";
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
