import * as useBalanceHook from "@/lib/hooks/use-balance";
import * as useSystemHealthHook from "@/lib/hooks/use-system-health";
import config from "@/tamagui.config";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";
import { DailyAllowanceWidget } from "../DailyAllowanceWidget";

// Mock hooks
jest.mock("@/lib/hooks/use-system-health");
jest.mock("@/lib/hooks/use-balance");
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

describe("DailyAllowanceWidget", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useBalanceHook.formatBalance as jest.Mock).mockImplementation(
      (val) => `€${(val / 100).toFixed(2)}`,
    );
  });

  it("renders nothing when loading", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: true,
      dailyAllowance: 0,
    });

    renderWithTheme(<DailyAllowanceWidget />);
    expect(screen.queryByText("Daily Allowance")).toBeNull();
  });

  it("renders GOOD allowance (green)", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      dailyAllowance: 50, // > 30
    });

    renderWithTheme(<DailyAllowanceWidget />);

    expect(screen.getByText("Daily Allowance")).toBeTruthy();
    expect(screen.getByText("€50.00")).toBeTruthy();
  });

  it("renders TIGHT allowance (orange)", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      dailyAllowance: 20, // 15-30
    });

    renderWithTheme(<DailyAllowanceWidget />);

    expect(screen.getByText("Daily Allowance")).toBeTruthy();
    expect(screen.getByText("€20.00")).toBeTruthy();
  });

  it("renders CRITICAL allowance (red)", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      dailyAllowance: 10, // < 15
    });

    renderWithTheme(<DailyAllowanceWidget />);

    expect(screen.getByText("Daily Allowance")).toBeTruthy();
    expect(screen.getByText("€10.00")).toBeTruthy();
  });
});
