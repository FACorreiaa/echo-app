/**
 * Tests for useBalance and useBalanceHistory hooks
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { formatBalance, useBalance, useBalanceHistory } from "../use-balance";

// Mock the balanceClient
jest.mock("@/lib/api/client", () => ({
  balanceClient: {
    getBalance: jest.fn(),
    getBalanceHistory: jest.fn(),
  },
}));

import { balanceClient } from "@/lib/api/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockedBalanceClient = balanceClient as any;

// Test wrapper with fresh QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe("useBalance", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches balance successfully", async () => {
    const mockResponse = {
      totalNetWorth: { amountMinor: BigInt(600000), currencyCode: "EUR" },
      safeToSpend: { amountMinor: BigInt(85000) },
      totalInvestments: { amountMinor: BigInt(500000) },
      upcomingBills: { amountMinor: BigInt(15000) },
      isEstimated: true,
      balances: [
        {
          accountId: "acc-1",
          accountName: "Checking",
          accountType: 2,
          cashBalance: { amountMinor: BigInt(100000), currencyCode: "EUR" },
          investmentBalance: undefined,
          change24h: { amountMinor: BigInt(-5000), currencyCode: "EUR" },
          lastActivity: { seconds: BigInt(1704067200) },
        },
        {
          accountId: "acc-2",
          accountName: "Investments",
          accountType: 5,
          cashBalance: undefined,
          investmentBalance: { amountMinor: BigInt(500000), currencyCode: "EUR" },
          change24h: { amountMinor: BigInt(10000), currencyCode: "EUR" },
          lastActivity: { seconds: BigInt(1704153600) },
        },
      ],
    };

    mockedBalanceClient.getBalance.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalNetWorth).toBe(6000); // €6000
    expect(result.current.data?.safeToSpend).toBe(850); // €850
    expect(result.current.data?.totalInvestments).toBe(5000); // €5000
    expect(result.current.data?.upcomingBills).toBe(150); // €150
    expect(result.current.data?.isEstimated).toBe(true);
    expect(result.current.data?.currencyCode).toBe("EUR");
    expect(result.current.data?.accounts).toHaveLength(2);
    expect(mockedBalanceClient.getBalance).toHaveBeenCalledWith({
      accountId: undefined,
    });
  });

  it("filters by account ID when provided", async () => {
    const mockResponse = {
      totalNetWorth: { amountMinor: BigInt(100000), currencyCode: "EUR" },
      safeToSpend: { amountMinor: BigInt(50000) },
      totalInvestments: { amountMinor: BigInt(0) },
      upcomingBills: { amountMinor: BigInt(0) },
      isEstimated: true,
      balances: [
        {
          accountId: "specific-account",
          accountName: "My Account",
          accountType: 1,
          cashBalance: { amountMinor: BigInt(100000), currencyCode: "EUR" },
        },
      ],
    };

    mockedBalanceClient.getBalance.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalance("specific-account"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedBalanceClient.getBalance).toHaveBeenCalledWith({
      accountId: "specific-account",
    });
    expect(result.current.data?.accounts).toHaveLength(1);
    expect(result.current.data?.accounts[0].accountId).toBe("specific-account");
  });

  it("handles empty balances", async () => {
    const mockResponse = {
      totalNetWorth: { amountMinor: BigInt(0), currencyCode: "EUR" },
      safeToSpend: { amountMinor: BigInt(0) },
      totalInvestments: { amountMinor: BigInt(0) },
      upcomingBills: { amountMinor: BigInt(0) },
      isEstimated: true,
      balances: [],
    };

    mockedBalanceClient.getBalance.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.totalNetWorth).toBe(0);
    expect(result.current.data?.accounts).toHaveLength(0);
  });

  it("handles fetch error", async () => {
    mockedBalanceClient.getBalance.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useBalance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it("correctly converts proto timestamp to Date for lastActivity", async () => {
    const timestamp = 1704067200; // 2024-01-01 00:00:00 UTC
    const mockResponse = {
      totalNetWorth: { amountMinor: BigInt(100000), currencyCode: "EUR" },
      safeToSpend: { amountMinor: BigInt(100000) },
      totalInvestments: { amountMinor: BigInt(0) },
      upcomingBills: { amountMinor: BigInt(0) },
      isEstimated: true,
      balances: [
        {
          accountId: "acc-1",
          accountName: "Test",
          accountType: 1,
          cashBalance: { amountMinor: BigInt(100000), currencyCode: "EUR" },
          lastActivity: { seconds: BigInt(timestamp) },
        },
      ],
    };

    mockedBalanceClient.getBalance.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.accounts[0].lastActivity).toBeInstanceOf(Date);
    expect(result.current.data?.accounts[0].lastActivity?.getTime()).toBe(timestamp * 1000);
  });
});

describe("useBalanceHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches balance history successfully", async () => {
    const mockResponse = {
      history: [
        {
          date: { seconds: BigInt(1704067200) },
          balance: { amountMinor: BigInt(100000) },
          change: { amountMinor: BigInt(0) },
        },
        {
          date: { seconds: BigInt(1704153600) },
          balance: { amountMinor: BigInt(95000) },
          change: { amountMinor: BigInt(-5000) },
        },
        {
          date: { seconds: BigInt(1704240000) },
          balance: { amountMinor: BigInt(110000) },
          change: { amountMinor: BigInt(15000) },
        },
      ],
      highestBalance: { amountMinor: BigInt(110000), currencyCode: "EUR" },
      lowestBalance: { amountMinor: BigInt(95000) },
      averageBalance: { amountMinor: BigInt(101667) },
    };

    mockedBalanceClient.getBalanceHistory.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalanceHistory(30), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.history).toHaveLength(3);
    expect(result.current.data?.highestBalance).toBe(1100); // €1100
    expect(result.current.data?.lowestBalance).toBe(950); // €950
    expect(result.current.data?.averageBalance).toBeCloseTo(1016.67, 0);
    expect(result.current.data?.currencyCode).toBe("EUR");
    expect(mockedBalanceClient.getBalanceHistory).toHaveBeenCalledWith({
      days: 30,
      accountId: undefined,
    });
  });

  it("requests correct number of days", async () => {
    const mockResponse = {
      history: [],
      highestBalance: { amountMinor: BigInt(0), currencyCode: "EUR" },
      lowestBalance: { amountMinor: BigInt(0) },
      averageBalance: { amountMinor: BigInt(0) },
    };

    mockedBalanceClient.getBalanceHistory.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalanceHistory(90), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedBalanceClient.getBalanceHistory).toHaveBeenCalledWith({
      days: 90,
      accountId: undefined,
    });
  });

  it("filters by account ID when provided", async () => {
    const mockResponse = {
      history: [],
      highestBalance: { amountMinor: BigInt(50000), currencyCode: "EUR" },
      lowestBalance: { amountMinor: BigInt(50000) },
      averageBalance: { amountMinor: BigInt(50000) },
    };

    mockedBalanceClient.getBalanceHistory.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalanceHistory(30, "account-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedBalanceClient.getBalanceHistory).toHaveBeenCalledWith({
      days: 30,
      accountId: "account-123",
    });
  });

  it("handles empty history", async () => {
    const mockResponse = {
      history: [],
      highestBalance: { amountMinor: BigInt(0), currencyCode: "EUR" },
      lowestBalance: { amountMinor: BigInt(0) },
      averageBalance: { amountMinor: BigInt(0) },
    };

    mockedBalanceClient.getBalanceHistory.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalanceHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.history).toHaveLength(0);
  });

  it("handles fetch error", async () => {
    mockedBalanceClient.getBalanceHistory.mockRejectedValueOnce(new Error("Server error"));

    const { result } = renderHook(() => useBalanceHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it("correctly converts history dates", async () => {
    const timestamp = 1704067200; // 2024-01-01 00:00:00 UTC
    const mockResponse = {
      history: [
        {
          date: { seconds: BigInt(timestamp) },
          balance: { amountMinor: BigInt(100000) },
          change: { amountMinor: BigInt(5000) },
        },
      ],
      highestBalance: { amountMinor: BigInt(100000), currencyCode: "EUR" },
      lowestBalance: { amountMinor: BigInt(100000) },
      averageBalance: { amountMinor: BigInt(100000) },
    };

    mockedBalanceClient.getBalanceHistory.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useBalanceHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.history[0].date).toBeInstanceOf(Date);
    expect(result.current.data?.history[0].date.getTime()).toBe(timestamp * 1000);
    expect(result.current.data?.history[0].balance).toBe(1000); // €1000
    expect(result.current.data?.history[0].change).toBe(50); // €50
  });
});

describe("formatBalance", () => {
  it("formats EUR currency correctly", () => {
    expect(formatBalance(1234.56, "EUR")).toBe("€1,234.56");
  });

  it("formats USD currency correctly", () => {
    expect(formatBalance(1234.56, "USD")).toBe("$1,234.56");
  });

  it("formats zero correctly", () => {
    expect(formatBalance(0, "EUR")).toBe("€0.00");
  });

  it("formats negative amounts correctly", () => {
    expect(formatBalance(-500.25, "EUR")).toBe("-€500.25");
  });

  it("uses EUR as default currency", () => {
    expect(formatBalance(100)).toBe("€100.00");
  });
});
