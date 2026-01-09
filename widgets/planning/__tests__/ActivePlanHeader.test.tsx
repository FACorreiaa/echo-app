import { render, screen } from "@testing-library/react-native";
import React from "react";

import * as useBalanceHook from "@/lib/hooks/use-balance";
import * as usePlansHook from "@/lib/hooks/use-plans";
import * as useActivePlanStoreHook from "@/lib/stores/use-active-plan-store";
import config from "@/tamagui.config";
import { TamaguiProvider } from "tamagui";
import { ActivePlanHeader } from "../ActivePlanHeader";

// Mock dependencies
jest.mock("@/lib/hooks/use-balance");
jest.mock("@/lib/hooks/use-plans");
jest.mock("@/lib/stores/use-active-plan-store");
jest.mock("@/components/ui/GlassyCard", () => {
  const { View } = require("react-native");
  return {
    GlassyCard: ({ children, ...props }: any) => (
      <View testID="glassy-card" {...props}>
        {children}
      </View>
    ),
  };
});

const renderWithTheme = (component: React.ReactNode) => {
  return render(<TamaguiProvider config={config}>{component}</TamaguiProvider>);
};

describe("ActivePlanHeader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing if no active plan", () => {
    (useActivePlanStoreHook.useActivePlanId as jest.Mock).mockReturnValue(null);
    (usePlansHook.usePlan as jest.Mock).mockReturnValue({ data: null, isLoading: false });
    (useBalanceHook.useBalance as jest.Mock).mockReturnValue({ data: null, isLoading: false });

    renderWithTheme(<ActivePlanHeader />);
    expect(screen.queryByText("System Health")).toBeNull();
  });

  it("renders fully funded state correctly", () => {
    (useActivePlanStoreHook.useActivePlanId as jest.Mock).mockReturnValue("plan-1");

    const mockPlan = {
      id: "plan-1",
      totalExpenses: 2000,
      categoryGroups: [
        {
          categories: [
            {
              items: [
                { itemType: "budget", budgeted: 1000, actual: 500 },
                { itemType: "recurring", budgeted: 1000, actual: 1000 },
              ],
            },
          ],
        },
      ],
    };
    (usePlansHook.usePlan as jest.Mock).mockReturnValue({ data: mockPlan, isLoading: false });

    const mockBalance = {
      totalNetWorth: 5000,
    };
    (useBalanceHook.useBalance as jest.Mock).mockReturnValue({
      data: mockBalance,
      isLoading: false,
    });
    (useBalanceHook.formatBalance as jest.Mock).mockImplementation((val) => `€${val}`);

    renderWithTheme(<ActivePlanHeader />);

    expect(screen.getByText("System Health")).toBeTruthy();
    expect(screen.getByText("FULLY FUNDED")).toBeTruthy();
    expect(screen.getByText("Execution (Spent vs Planned)")).toBeTruthy();

    // 1500 spent / 2000 budgeted
    expect(screen.getByText(/€1500/)).toBeTruthy();
    expect(screen.getByText(/\/ €2000/)).toBeTruthy();
    expect(screen.getByText(/75% Utilized/)).toBeTruthy();
  });

  it("renders liquidity warning when underfunded", () => {
    (useActivePlanStoreHook.useActivePlanId as jest.Mock).mockReturnValue("plan-1");

    const mockPlan = {
      id: "plan-1",
      totalExpenses: 5000, // Needs 5000
      categoryGroups: [],
    };
    (usePlansHook.usePlan as jest.Mock).mockReturnValue({ data: mockPlan, isLoading: false });

    const mockBalance = {
      totalNetWorth: 2000, // Only has 2000
    };
    (useBalanceHook.useBalance as jest.Mock).mockReturnValue({
      data: mockBalance,
      isLoading: false,
    });

    renderWithTheme(<ActivePlanHeader />);

    expect(screen.getByText("LIQUIDITY WARNING")).toBeTruthy();
    // Shortfall 3000
    expect(screen.getByText(/Shortfall: €3000/)).toBeTruthy();
  });
});
