/**
 * Tests for alert-related hooks in use-insights.ts
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useAlerts, useMarkAlertRead, useDismissAlert, useMonthlyInsights } from "../use-insights";

// Mock the insightsClient
jest.mock("@/lib/api/client", () => ({
  insightsClient: {
    listAlerts: jest.fn(),
    markAlertRead: jest.fn(),
    dismissAlert: jest.fn(),
    getMonthlyInsights: jest.fn(),
  },
}));

import { insightsClient } from "@/lib/api/client";

const mockedInsightsClient = insightsClient as jest.Mocked<typeof insightsClient>;

// Test wrapper with fresh QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
};

describe("useAlerts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches alerts successfully", async () => {
    const mockAlerts = [
      {
        id: "alert-1",
        alertType: "pace_warning",
        severity: "warning",
        title: "Spending Alert",
        message: "You're spending 30% more",
        isRead: false,
        isDismissed: false,
        alertDate: { seconds: BigInt(1704067200), nanos: 0 },
        createdAt: { seconds: BigInt(1704067200), nanos: 0 },
      },
      {
        id: "alert-2",
        alertType: "pace_warning",
        severity: "critical",
        title: "High Spending",
        message: "You're spending 50% more",
        isRead: false,
        isDismissed: false,
        alertDate: { seconds: BigInt(1704153600), nanos: 0 },
        createdAt: { seconds: BigInt(1704153600), nanos: 0 },
      },
    ];

    mockedInsightsClient.listAlerts.mockResolvedValueOnce({
      alerts: mockAlerts,
    });

    const { result } = renderHook(() => useAlerts(true, 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].title).toBe("Spending Alert");
    expect(result.current.data?.[0].severity).toBe("warning");
    expect(mockedInsightsClient.listAlerts).toHaveBeenCalledWith({
      unreadOnly: true,
      limit: 20,
    });
  });

  it("returns empty array when no alerts", async () => {
    mockedInsightsClient.listAlerts.mockResolvedValueOnce({
      alerts: [],
    });

    const { result } = renderHook(() => useAlerts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(0);
  });

  it("handles fetch error", async () => {
    mockedInsightsClient.listAlerts.mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useAlerts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });
});

describe("useMarkAlertRead", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks alert as read successfully", async () => {
    mockedInsightsClient.markAlertRead.mockResolvedValueOnce({});

    const { result } = renderHook(() => useMarkAlertRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("alert-123");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedInsightsClient.markAlertRead).toHaveBeenCalledWith({
      alertId: "alert-123",
    });
  });

  it("handles mark read error", async () => {
    mockedInsightsClient.markAlertRead.mockRejectedValueOnce(new Error("Not found"));

    const { result } = renderHook(() => useMarkAlertRead(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("nonexistent-alert");

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useDismissAlert", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("dismisses alert successfully", async () => {
    mockedInsightsClient.dismissAlert.mockResolvedValueOnce({});

    const { result } = renderHook(() => useDismissAlert(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("alert-456");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockedInsightsClient.dismissAlert).toHaveBeenCalledWith({
      alertId: "alert-456",
    });
  });

  it("handles dismiss error", async () => {
    mockedInsightsClient.dismissAlert.mockRejectedValueOnce(new Error("Permission denied"));

    const { result } = renderHook(() => useDismissAlert(), {
      wrapper: createWrapper(),
    });

    result.current.mutate("alert-789");

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("Alert type conversion", () => {
  it("correctly converts proto timestamp to Date", async () => {
    const timestamp = 1704067200; // 2024-01-01 00:00:00 UTC
    const mockAlerts = [
      {
        id: "alert-1",
        alertType: "pace_warning",
        severity: "info",
        title: "Test",
        message: "Test message",
        isRead: false,
        isDismissed: false,
        alertDate: { seconds: BigInt(timestamp), nanos: 0 },
        createdAt: { seconds: BigInt(timestamp), nanos: 0 },
      },
    ];

    mockedInsightsClient.listAlerts.mockResolvedValueOnce({
      alerts: mockAlerts,
    });

    const { result } = renderHook(() => useAlerts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const alert = result.current.data?.[0];
    expect(alert?.alertDate).toBeInstanceOf(Date);
    expect(alert?.createdAt).toBeInstanceOf(Date);
  });
});

describe("useMonthlyInsights", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches monthly insights successfully", async () => {
    const mockInsights = {
      insights: {
        month: "2025-01",
        comparedToMonth: "2024-12",
        totalSpending: { amountMinor: BigInt(345678), currencyCode: "EUR" },
        totalIncome: { amountMinor: BigInt(500000), currencyCode: "EUR" },
        netChange: { amountMinor: BigInt(154322), currencyCode: "EUR" },
        changes: [
          {
            changeType: "CHANGE_TYPE_CATEGORY_INCREASED",
            title: "Food spending increased",
            description: "You spent 25% more on Food this month",
            categoryName: "Food",
            currentAmount: { amountMinor: BigInt(50000), currencyCode: "EUR" },
            previousAmount: { amountMinor: BigInt(40000), currencyCode: "EUR" },
            percentChange: 25.0,
          },
          {
            changeType: "CHANGE_TYPE_NEW_MERCHANT",
            title: "New merchant: Whole Foods",
            description: "First time spending at Whole Foods",
            merchantName: "Whole Foods",
            currentAmount: { amountMinor: BigInt(15000), currencyCode: "EUR" },
            transactionCount: 3,
            categoryName: "Groceries",
          },
          {
            changeType: "CHANGE_TYPE_INCOME_DECREASED",
            title: "Income decreased",
            description: "Your income was 10% lower than last month",
            currentAmount: { amountMinor: BigInt(450000), currencyCode: "EUR" },
            previousAmount: { amountMinor: BigInt(500000), currencyCode: "EUR" },
            percentChange: -10.0,
          },
        ],
        recommendedAction: {
          actionType: "ACTION_TYPE_UNCATEGORIZED",
          title: "Categorize 15 transactions",
          description: "You have 15 uncategorized transactions worth €234.56",
          priority: 1,
          metadata: '{"count": 15, "totalAmount": 23456}',
        },
      },
    };

    mockedInsightsClient.getMonthlyInsights.mockResolvedValueOnce(mockInsights);

    const { result } = renderHook(() => useMonthlyInsights("2025-01"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data?.month).toBe("2025-01");
    expect(result.current.data?.thingsChanged).toHaveLength(3);
    expect(result.current.data?.recommendedAction).toBeDefined();
    expect(result.current.data?.totalSpending).toBe(3456.78);
    expect(result.current.data?.totalIncome).toBe(5000.0);
    expect(mockedInsightsClient.getMonthlyInsights).toHaveBeenCalledWith({
      month: "2025-01",
    });
  });

  it("parses category change correctly", async () => {
    const mockInsights = {
      insights: {
        month: "2025-01",
        comparedToMonth: "2024-12",
        changes: [
          {
            changeType: "CHANGE_TYPE_CATEGORY_INCREASED",
            title: "Food spending up",
            description: "Spent more on food",
            categoryName: "Food",
            currentAmount: { amountMinor: BigInt(50000), currencyCode: "EUR" },
            previousAmount: { amountMinor: BigInt(40000), currencyCode: "EUR" },
            percentChange: 25.0,
          },
        ],
      },
    };

    mockedInsightsClient.getMonthlyInsights.mockResolvedValueOnce(mockInsights);

    const { result } = renderHook(() => useMonthlyInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const change = result.current.data?.thingsChanged[0];
    expect(change?.type).toBe("category_change");
    expect(change?.categoryChange?.categoryName).toBe("Food");
    expect(change?.categoryChange?.currentAmount).toBe(500.0);
    expect(change?.categoryChange?.previousAmount).toBe(400.0);
    expect(change?.categoryChange?.percentChange).toBe(25.0);
    expect(change?.categoryChange?.trend).toBe("up");
  });

  it("parses new merchant correctly", async () => {
    const mockInsights = {
      insights: {
        month: "2025-01",
        changes: [
          {
            changeType: "CHANGE_TYPE_NEW_MERCHANT",
            title: "New: Starbucks",
            description: "First purchase",
            merchantName: "Starbucks",
            currentAmount: { amountMinor: BigInt(1250), currencyCode: "EUR" },
            transactionCount: 4,
            categoryName: "Coffee",
          },
        ],
      },
    };

    mockedInsightsClient.getMonthlyInsights.mockResolvedValueOnce(mockInsights);

    const { result } = renderHook(() => useMonthlyInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const change = result.current.data?.thingsChanged[0];
    expect(change?.type).toBe("new_merchant");
    expect(change?.newMerchant?.merchantName).toBe("Starbucks");
    expect(change?.newMerchant?.amount).toBe(12.5);
    expect(change?.newMerchant?.transactionCount).toBe(4);
    expect(change?.newMerchant?.categoryName).toBe("Coffee");
  });

  it("parses income change correctly", async () => {
    const mockInsights = {
      insights: {
        month: "2025-01",
        changes: [
          {
            changeType: "CHANGE_TYPE_INCOME_INCREASED",
            title: "Income up",
            description: "Higher income this month",
            currentAmount: { amountMinor: BigInt(550000), currencyCode: "EUR" },
            previousAmount: { amountMinor: BigInt(500000), currencyCode: "EUR" },
            percentChange: 10.0,
          },
        ],
      },
    };

    mockedInsightsClient.getMonthlyInsights.mockResolvedValueOnce(mockInsights);

    const { result } = renderHook(() => useMonthlyInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const change = result.current.data?.thingsChanged[0];
    expect(change?.type).toBe("income_change");
    expect(change?.incomeChange?.currentAmount).toBe(5500.0);
    expect(change?.incomeChange?.previousAmount).toBe(5000.0);
    expect(change?.incomeChange?.percentChange).toBe(10.0);
    expect(change?.incomeChange?.trend).toBe("up");
  });

  it("parses recommended action correctly", async () => {
    const mockInsights = {
      insights: {
        month: "2025-01",
        changes: [],
        recommendedAction: {
          actionType: "ACTION_TYPE_HIGH_SPENDING",
          title: "Review high spending",
          description: "Food category is 40% over budget",
          priority: 2,
          metadata: '{"categoryId": "food-123", "amount": 50000}',
        },
      },
    };

    mockedInsightsClient.getMonthlyInsights.mockResolvedValueOnce(mockInsights);

    const { result } = renderHook(() => useMonthlyInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const action = result.current.data?.recommendedAction;
    expect(action?.actionType).toBe("high_spending");
    expect(action?.title).toBe("Review high spending");
    expect(action?.description).toBe("Food category is 40% over budget");
    expect(action?.priority).toBe(2);
    expect(action?.metadata).toEqual({ categoryId: "food-123", amount: 50000 });
  });

  it("handles no insights gracefully", async () => {
    const mockInsights = {
      insights: {
        month: "2025-01",
        comparedToMonth: "2024-12",
        changes: [],
        recommendedAction: null,
      },
    };

    mockedInsightsClient.getMonthlyInsights.mockResolvedValueOnce(mockInsights);

    const { result } = renderHook(() => useMonthlyInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.thingsChanged).toHaveLength(0);
    expect(result.current.data?.recommendedAction).toBeNull();
  });

  it("handles API error gracefully with fallback", async () => {
    mockedInsightsClient.getMonthlyInsights.mockRejectedValueOnce(new Error("Not implemented"));

    // Spy on console.warn to verify fallback message
    const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

    const { result } = renderHook(() => useMonthlyInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should return empty fallback data
    expect(result.current.data?.thingsChanged).toHaveLength(0);
    expect(result.current.data?.recommendedAction).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Monthly insights endpoint not available"),
      expect.any(Error),
    );

    consoleWarnSpy.mockRestore();
  });

  it("limits changes to 3 items max", async () => {
    const mockInsights = {
      insights: {
        month: "2025-01",
        changes: [
          {
            changeType: "CHANGE_TYPE_CATEGORY_INCREASED",
            title: "Change 1",
            description: "Description 1",
          },
          {
            changeType: "CHANGE_TYPE_CATEGORY_INCREASED",
            title: "Change 2",
            description: "Description 2",
          },
          {
            changeType: "CHANGE_TYPE_CATEGORY_INCREASED",
            title: "Change 3",
            description: "Description 3",
          },
          {
            changeType: "CHANGE_TYPE_CATEGORY_INCREASED",
            title: "Change 4",
            description: "Description 4",
          },
          {
            changeType: "CHANGE_TYPE_CATEGORY_INCREASED",
            title: "Change 5",
            description: "Description 5",
          },
        ],
      },
    };

    mockedInsightsClient.getMonthlyInsights.mockResolvedValueOnce(mockInsights);

    const { result } = renderHook(() => useMonthlyInsights(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should only return first 3
    expect(result.current.data?.thingsChanged).toHaveLength(3);
    expect(result.current.data?.thingsChanged[0]?.title).toBe("Change 1");
    expect(result.current.data?.thingsChanged[2]?.title).toBe("Change 3");
  });
});
