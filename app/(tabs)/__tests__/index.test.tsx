import * as useSystemHealthHook from "@/lib/hooks/use-system-health";
import config from "@/tamagui.config";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";
import HomeScreen from "../index";

// Mocks
jest.mock("@/lib/hooks/use-system-health");
jest.mock("@/lib/hooks/use-accounts", () => ({
  useAccounts: jest.fn(() => ({ data: [], isLoading: false })),
}));
jest.mock("@/lib/hooks/use-balance", () => {
  const original = jest.requireActual("@/lib/hooks/use-balance");
  return {
    ...original,
    useSetOpeningBalance: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
  };
});
jest.mock("@/lib/hooks/use-insights", () => ({
  useSpendingPulse: jest.fn(() => ({ data: null })),
  useDashboardBlocks: jest.fn(() => ({ data: [] })),
}));
jest.mock("@/lib/hooks/use-transactions", () => ({
  useRecentTransactions: jest.fn(() => ({ data: [], isLoading: false })),
}));
jest.mock("@/lib/stores/auth-store", () => ({
  useAuthStore: (selector: any) => selector({ user: { displayName: "Test User" } }),
}));
jest.mock("expo-router", () => ({ useRouter: jest.fn(() => ({ push: jest.fn() })) }));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(() => ({ top: 0 })),
}));
jest.mock("@/components", () => ({
  AlertBell: () => null,
  Avatar: () => null,
  BalanceHistoryChart: () => null,
  GlassyCard: ({ children }: any) => <>{children}</>,
  NetWorthCard: () => null,
  QuickCapture: () => null,
}));
jest.mock("@/widgets/insights/PacingMeter", () => ({ PacingMeter: () => null }));
jest.mock("@/widgets/insights/SystemHealthScoreCard", () => ({
  SystemHealthScoreCard: () => null,
}));
jest.mock("@/widgets/insights/DailyAllowanceWidget", () => ({ DailyAllowanceWidget: () => null }));
jest.mock("@/widgets/insights/InsightSummaryCard", () => ({ InsightSummaryCard: () => null }));
jest.mock("@/widgets/bento", () => ({
  BentoCard: ({ children }: any) => <>{children}</>,
  HookCard: () => null,
  InboxBadge: () => null,
  WhatIfSlider: () => null,
}));

const renderWithTheme = (component: React.ReactNode) => {
  return render(<TamaguiProvider config={config}>{component}</TamaguiProvider>);
};

describe("HomeScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders welcome message", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      score: 80,
      status: "WARNING",
      totalBudgeted: 1000,
      totalSpent: 500,
      daysElapsed: 15,
      daysTotal: 30,
      isLoading: false,
    });

    renderWithTheme(<HomeScreen />);

    // Check for greeting/user
    expect(screen.getByText("Test User")).toBeTruthy();
  });
});
