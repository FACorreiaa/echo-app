import { render, screen } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";

import config from "@/tamagui.config";
import { BudgetCard } from "../BudgetCard";
import { GoalCard } from "../GoalCard";
import { RecurringCard } from "../RecurringCard";

// Mock GlassyCard to avoid complex rendering issues
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

const mockItem: any = {
  id: "1",
  name: "Test Item",
  budgetedMinor: 10000n, // €100.00
  actualMinor: 5000n, // €50.00
  configId: "cfg1",
};

describe("Plan Widgets", () => {
  describe("GoalCard", () => {
    it("renders correctly", () => {
      renderWithTheme(<GoalCard goal={mockItem} />);
      expect(screen.getByText("Test Item")).toBeTruthy();
      expect(screen.getByText(/Target:.*100/)).toBeTruthy();
      expect(screen.getByText("50%")).toBeTruthy();
    });

    it("shows completed state", () => {
      const completedItem = { ...mockItem, actualMinor: 10000n };
      renderWithTheme(<GoalCard goal={completedItem} />);
      expect(screen.getByText("100%")).toBeTruthy();
    });
  });

  describe("BudgetCard", () => {
    it("renders correctly", () => {
      renderWithTheme(<BudgetCard item={mockItem} />);
      expect(screen.getByText("Test Item")).toBeTruthy();
      expect(screen.getByText(/Budget:.*100/)).toBeTruthy();
      expect(screen.getByText(/.*50.* left/)).toBeTruthy();
    });

    it("shows over budget warning", () => {
      const overItem = { ...mockItem, actualMinor: 15000n };
      renderWithTheme(<BudgetCard item={overItem} />);
      expect(screen.getByText("OVER")).toBeTruthy();
      expect(screen.getByText(/over/)).toBeTruthy();
    });
  });

  describe("RecurringCard", () => {
    it("renders correctly", () => {
      renderWithTheme(<RecurringCard item={mockItem} />);
      expect(screen.getByText("Test Item")).toBeTruthy();
      expect(screen.getByText("Unpaid")).toBeTruthy();
    });

    it("shows paid state", () => {
      const paidItem = { ...mockItem, actualMinor: 10000n };
      renderWithTheme(<RecurringCard item={paidItem} />);
      expect(screen.getByText("PAID")).toBeTruthy();
    });
  });
});
