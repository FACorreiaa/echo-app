/**
 * API Client using Connect-RPC v2 with BSR-generated types
 */

import { AuthService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/auth_pb";
import { FinanceService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/finance_pb";
import { ImportService } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/imports_pb";
import { ConnectError, createClient, type Client } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { getAccessToken } from "../storage/token-storage";
import { API_CONFIG } from "./config";

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
      return next(req);
    },
  ],
});

// Create typed clients
export const authClient: Client<typeof AuthService> = createClient(AuthService, transport);
export const financeClient: Client<typeof FinanceService> = createClient(FinanceService, transport);
export const importClient: Client<typeof ImportService> = createClient(ImportService, transport);

// Re-export Connect error for catch blocks
export { ConnectError };
