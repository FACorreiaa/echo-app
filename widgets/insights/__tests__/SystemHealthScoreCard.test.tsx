import * as useSystemHealthHook from "@/lib/hooks/use-system-health";
import config from "@/tamagui.config";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";
import { SystemHealthScoreCard } from "../SystemHealthScoreCard";

// Mock hooks
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

// Mock Moti
jest.mock("moti", () => ({
  View: ({ children, ..._props }: any) => <>{children}</>,
}));

const renderWithTheme = (component: React.ReactNode) => {
  return render(<TamaguiProvider config={config}>{component}</TamaguiProvider>);
};

describe("SystemHealthScoreCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when loading", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: true,
      score: 0,
    });

    renderWithTheme(<SystemHealthScoreCard />);
    expect(screen.queryByText("System Health")).toBeNull();
  });

  it("renders HEALTHY state correctly", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      score: 95,
      status: "HEALTHY",
    });

    renderWithTheme(<SystemHealthScoreCard />);

    expect(screen.getByText("System Health")).toBeTruthy();
    expect(screen.getByText("95")).toBeTruthy();
    expect(screen.getByText("SYSTEM OPTIMAL")).toBeTruthy();
    expect(screen.getByText("You are on track to fund all goals.")).toBeTruthy();
  });

  it("renders WARNING state correctly", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      score: 75,
      status: "WARNING",
    });

    renderWithTheme(<SystemHealthScoreCard />);

    expect(screen.getByText("75")).toBeTruthy();
    expect(screen.getByText("PACING WARNING")).toBeTruthy();
    expect(screen.getByText("Spending is outpacing time.")).toBeTruthy();
  });

  it("renders CRITICAL state correctly", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      score: 40,
      status: "CRITICAL",
    });

    renderWithTheme(<SystemHealthScoreCard />);

    expect(screen.getByText("40")).toBeTruthy();
    expect(screen.getByText("CRITICAL STATUS")).toBeTruthy();
    expect(screen.getByText("Immediate attention required.")).toBeTruthy();
  });
});
