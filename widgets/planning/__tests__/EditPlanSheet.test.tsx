/**
 * Tests for EditPlanSheet component
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";

import { usePlan, useUpdatePlanStructure } from "@/lib/hooks/use-plans";
import config from "@/tamagui.config";
import { EditPlanSheet } from "../EditPlanSheet";

// Mock ThemeContext - MUST be before imports
jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: true, setIsDark: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mocks
jest.mock("@/lib/hooks/use-item-configs", () => ({
  useItemConfigs: () => ({
    data: [
      { id: "1", label: "Budget", shortCode: "B", colorHex: "#22c55e", targetTab: "budgets" },
      { id: "2", label: "Recurring", shortCode: "R", colorHex: "#f59e0b", targetTab: "recurring" },
      { id: "3", label: "Savings Goal", shortCode: "S", colorHex: "#6366f1", targetTab: "goals" },
      { id: "4", label: "Income", shortCode: "IN", colorHex: "#14b8a6", targetTab: "income" },
    ],
    isLoading: false,
  }),
  DEFAULT_ITEM_CONFIGS: [],
}));

jest.mock("@/lib/hooks/use-plans", () => ({
  usePlan: jest.fn(),
  useUpdatePlanStructure: jest.fn(),
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: "",
}));

// Mock expo-blur
jest.mock("expo-blur", () => ({
  BlurView: ({ children }: { children: React.ReactNode }) => children,
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

describe("EditPlanSheet", () => {
  const mockPlan = {
    id: "plan-123",
    name: "My Plan",
    categoryGroups: [
      {
        id: "group-1",
        name: "Essentials",
        targetPercent: 50,
        color: "#123456",
        categories: [
          {
            id: "cat-1",
            name: "Housing",
            icon: "home",
            items: [
              {
                id: "item-1",
                name: "Rent",
                budgeted: 1000,
                itemType: "budget",
                configId: "1",
              },
            ],
          },
        ],
      },
      {
        id: "group-2",
        name: "Savings",
        targetPercent: 20,
        color: "#654321",
        categories: [
          {
            id: "cat-2",
            name: "Goals",
            icon: "star",
            items: [
              {
                id: "item-2",
                name: "Emergency Fund",
                budgeted: 500,
                actual: 100, // 100 already saved
                itemType: "goal",
                configId: "3",
              },
            ],
          },
        ],
      },
    ],
  };

  const mockMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (usePlan as jest.Mock).mockReturnValue({
      data: mockPlan,
      isLoading: false,
    });
    (useUpdatePlanStructure as jest.Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });

  it("renders correctly with plan data", () => {
    const { getByText } = render(
      <TestWrapper>
        <EditPlanSheet planId="plan-123" open={true} onOpenChange={jest.fn()} />
      </TestWrapper>,
    );

    expect(getByText("Edit Plan Structure")).toBeTruthy();
    expect(getByText("Essentials")).toBeTruthy();

    // Expand group
    fireEvent.press(getByText("Essentials"));

    expect(getByText("Housing")).toBeTruthy();

    // Expand category
    fireEvent.press(getByText("Housing"));
    expect(getByText("Rent")).toBeTruthy();

    // Check for goal item
    expect(getByText("Savings")).toBeTruthy();
    fireEvent.press(getByText("Savings"));

    expect(getByText("Goals")).toBeTruthy();
    fireEvent.press(getByText("Goals"));

    expect(getByText("Emergency Fund")).toBeTruthy();
  });

  it("calls updatePlan on save", async () => {
    const { getByText } = render(
      <TestWrapper>
        <EditPlanSheet planId="plan-123" open={true} onOpenChange={jest.fn()} />
      </TestWrapper>,
    );

    const saveButton = getByText("Save Changes");
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledTimes(1);
    });

    // Verify payload structure matches expected
    const callArg = mockMutateAsync.mock.calls[0][0];
    expect(callArg.planId).toBe("plan-123");
    expect(callArg.categoryGroups).toHaveLength(2);
    expect(callArg.categoryGroups[0].categories[0].items[0].name).toBe("Rent");
  });

  it("displays loading state", () => {
    (usePlan as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
    });

    const { getByText } = render(
      <TestWrapper>
        <EditPlanSheet planId="plan-123" open={true} onOpenChange={jest.fn()} />
      </TestWrapper>,
    );

    expect(getByText("Loading plan...")).toBeTruthy();
  });
});
