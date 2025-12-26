/**
 * Auth API
 * Wrapper functions for auth RPC calls using Connect v2
 */

import {
  GetMeRequestSchema,
  LoginRequestSchema,
  LogoutRequestSchema,
  RefreshRequestSchema,
  RegisterRequestSchema,
  type AuthResponse,
  type GetMeResponse,
} from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/auth_pb";
import { create } from "@bufbuild/protobuf";
import { authClient } from "./client";

// Re-export types (only the ones that are exported from the BSR package)
export type { AuthResponse, GetMeResponse };

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  username?: string,
): Promise<AuthResponse> {
  const request = create(RegisterRequestSchema, {
    email,
    password,
    username,
  });
  return authClient.register(request);
}

/**
 * Log in with email and password
 */
export async function login(email: string, password: string): Promise<AuthResponse> {
  const request = create(LoginRequestSchema, {
    email,
    password,
  });
  return authClient.login(request);
}

/**
 * Refresh access token using refresh token
 */
export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const request = create(RefreshRequestSchema, {
    refreshToken,
  });
  return authClient.refresh(request);
}

/**
 * Log out and invalidate refresh token
 */
export async function logout(refreshToken: string): Promise<void> {
  const request = create(LogoutRequestSchema, {
    refreshToken,
  });
  await authClient.logout(request);
}

/**
 * Get current authenticated user
 */
export async function getMe(): Promise<GetMeResponse> {
  const request = create(GetMeRequestSchema, {});
  return authClient.getMe(request);
}
