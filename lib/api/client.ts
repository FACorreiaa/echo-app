/**
 * API Client using Connect-RPC v2 with BSR-generated types
 */

import { AuthService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/auth_pb";
import { BalanceService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/balance_pb";
import { FinanceService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/finance_pb";
import { ImportService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/imports_pb";
import { InsightsService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/insights_pb";
import { PlanService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/plan_pb";
import { ConnectError, createClient, type Client } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { clearAllAuthState, getAccessToken } from "../storage/token-storage";
import { API_CONFIG } from "./config";

// Track if we're currently handling a 401 to prevent infinite loops
let isHandling401 = false;

// Create the Connect transport
const transport = createConnectTransport({
  baseUrl: API_CONFIG.baseUrl,
  // Add auth header interceptor
  interceptors: [
    (next) => async (req) => {
      const token = await getAccessToken();
      if (token) {
        req.header.set("Authorization", `Bearer ${token}`);
      }
      try {
        return await next(req);
      } catch (error) {
        // Handle 401 errors - clear tokens and force re-login
        if (
          error instanceof ConnectError &&
          error.code === 16 && // Code.Unauthenticated
          !isHandling401
        ) {
          isHandling401 = true;
          console.warn("[API] Unauthenticated error - clearing all auth state");
          await clearAllAuthState();
          isHandling401 = false;
          // The auth store will detect token absence and redirect to login
        }
        throw error;
      }
    },
  ],
});

// Create typed clients
export const authClient: Client<typeof AuthService> = createClient(AuthService, transport);
export const financeClient: Client<typeof FinanceService> = createClient(FinanceService, transport);
export const importClient: Client<typeof ImportService> = createClient(ImportService, transport);
export const insightsClient: Client<typeof InsightsService> = createClient(
  InsightsService,
  transport,
);
export const balanceClient: Client<typeof BalanceService> = createClient(BalanceService, transport);
export const planClient: Client<typeof PlanService> = createClient(PlanService, transport);

// Re-export Connect error for catch blocks
export { ConnectError };
