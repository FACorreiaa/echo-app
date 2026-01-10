import * as useSystemHealthHook from "@/lib/hooks/use-system-health";
import config from "@/tamagui.config";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";
import { InsightSummaryCard } from "../InsightSummaryCard";

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

const renderWithTheme = (component: React.ReactNode) => {
  return render(<TamaguiProvider config={config}>{component}</TamaguiProvider>);
};

describe("InsightSummaryCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders nothing when loading", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: true,
      insightMessages: [],
    });

    const { toJSON } = renderWithTheme(<InsightSummaryCard />);
    expect(toJSON()).toBeNull();
  });

  it("renders nothing when empty messages", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      insightMessages: [],
    });

    const { toJSON } = renderWithTheme(<InsightSummaryCard />);
    expect(toJSON()).toBeNull();
  });

  it("renders messages list", () => {
    (useSystemHealthHook.useSystemHealth as jest.Mock).mockReturnValue({
      isLoading: false,
      insightMessages: [
        "Spending is outpacing time.",
        "Liquidity shortfall predicted.",
        "Goal fully funded!",
      ],
    });

    renderWithTheme(<InsightSummaryCard />);

    expect(screen.getByText("Spending is outpacing time.")).toBeTruthy();
    expect(screen.getByText("Liquidity shortfall predicted.")).toBeTruthy();
    expect(screen.getByText("Goal fully funded!")).toBeTruthy();
  });
});
