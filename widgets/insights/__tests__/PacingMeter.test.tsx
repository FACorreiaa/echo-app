import config from "@/tamagui.config";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";
import { PacingMeter } from "../PacingMeter";

// Mock Moti
jest.mock("moti", () => ({
  MotiView: ({ children, ..._props }: any) => {
    // Pass style width to children for verifying width if needed, or just partial mock
    return <>{children}</>;
  },
}));

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

describe("PacingMeter", () => {
  it("renders Under Budget state correctly", () => {
    // Budget 1000, Spent 100 (10%), Day 15/30 (50% time)
    // Should be VERY under budget
    renderWithTheme(
      <PacingMeter currentSpend={100} monthlyBudget={1000} daysElapsed={15} daysTotal={30} />,
    );

    expect(screen.getByText("Monthly Pacing")).toBeTruthy();
    expect(screen.getByText("Day 15 / 30")).toBeTruthy();
    expect(screen.getByText("Great! Well under budget 💪")).toBeTruthy();
  });

  it("renders Over Budget state correctly", () => {
    // Budget 1000, Spent 800 (80%), Day 15/30 (50% time)
    // Should be OVER budget (1.6x burn rate)
    renderWithTheme(
      <PacingMeter currentSpend={800} monthlyBudget={1000} daysElapsed={15} daysTotal={30} />,
    );

    expect(screen.getByText("1.5x faster than time! ⚠️", { exact: false })).toBeTruthy();
  });

  it("renders Track/Ghost info", () => {
    renderWithTheme(
      <PacingMeter currentSpend={500} monthlyBudget={1000} daysElapsed={15} daysTotal={30} />,
    );
    // Spending 50%, Time 50% => On Track
    expect(screen.getByText("On track")).toBeTruthy();
    expect(screen.getByText("Today")).toBeTruthy();
  });
});
