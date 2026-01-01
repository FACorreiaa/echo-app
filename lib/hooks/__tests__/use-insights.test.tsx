/**
 * Tests for alert-related hooks in use-insights.ts
 */

import { renderHook, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

import { useAlerts, useMarkAlertRead, useDismissAlert } from "../use-insights";

// Mock the insightsClient
jest.mock("@/lib/api/client", () => ({
  insightsClient: {
    listAlerts: jest.fn(),
    markAlertRead: jest.fn(),
    dismissAlert: jest.fn(),
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
