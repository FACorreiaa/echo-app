import { render, screen } from "@testing-library/react-native";
import React from "react";

import * as useBalanceHook from "@/lib/hooks/use-balance";
import * as useSystemHealthHook from "@/lib/hooks/use-system-health";
import config from "@/tamagui.config";
import { TamaguiProvider } from "tamagui";
import { ActivePlanHeader } from "../ActivePlanHeader";

// Mock dependencies
jest.mock("@/lib/hooks/use-balance");
jest.mock("@/lib/hooks/use-system-health");
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
    (useBalanceHook.formatBalance as jest.Mock).mockImplementation((val) => `€${val}`);
  });

  it("renders nothing if loading", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: true,
      score: 0,
    });

    renderWithTheme(<ActivePlanHeader />);
    expect(screen.queryByText("System Health")).toBeNull();
  });

  it("renders HEALTHY state with optimal score", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      score: 95,
      status: "HEALTHY",
      liquidityRatio: 1.5,
      burnRatePacing: 0.8, // Good, under 1.0
      goalVelocity: 1.0,
      fundingGap: 100,
      dailyAllowance: 50,
      insightMessages: [],
    });

    renderWithTheme(<ActivePlanHeader />);

    expect(screen.getByText("System Health")).toBeTruthy();
    expect(screen.getByText("SYSTEM OPTIMAL • 95")).toBeTruthy();

    // Check Pacing
    expect(screen.getByText("Burn Rate Pacing")).toBeTruthy();
    expect(screen.getByText("0.80x")).toBeTruthy();

    // Check Velocity
    expect(screen.getByText("Goal Velocity")).toBeTruthy();
    expect(screen.getByText("100%")).toBeTruthy();
  });

  it("renders CRITICAL state with shortfall message", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      score: 40,
      status: "CRITICAL",
      liquidityRatio: 0.5,
      burnRatePacing: 1.5,
      goalVelocity: 0.2,
      fundingGap: -2000,
      dailyAllowance: 0,
      insightMessages: [],
    });

    renderWithTheme(<ActivePlanHeader />);

    expect(screen.getByText("SYSTEM CRITICAL • 40")).toBeTruthy();

    // Check Pacing Warning
    expect(screen.getByText("1.50x")).toBeTruthy();

    // Check Shortfall Message
    expect(screen.getByText(/Liquidity Shortfall: €2000/)).toBeTruthy();
  });

  it("renders WARNING state", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      score: 75,
      status: "WARNING",
      liquidityRatio: 1.1,
      burnRatePacing: 1.1,
      goalVelocity: 0.5,
      fundingGap: 200,
      dailyAllowance: 10,
      insightMessages: [],
    });

    renderWithTheme(<ActivePlanHeader />);

    expect(screen.getByText("PACING WARNING • 75")).toBeTruthy();
  });
});
