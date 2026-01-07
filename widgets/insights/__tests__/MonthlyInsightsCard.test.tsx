/**
 * Tests for MonthlyInsightsCard widget
 */

// Mock expo-blur (required by GlassyCard) - MUST be before imports
jest.mock("expo-blur", () => ({
  BlurView: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock ThemeContext - MUST be before imports
jest.mock("@/contexts/ThemeContext", () => ({
  useTheme: () => ({ isDark: true, setIsDark: jest.fn() }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";

import config from "@/tamagui.config";

import { MonthlyInsightsCard } from "../MonthlyInsightsCard";
import type { MonthlyInsight, RecommendedAction } from "@/lib/hooks/use-insights";

// Test wrapper with Tamagui
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

const mockCategoryChange: MonthlyInsight = {
  type: "category_change",
  title: "Food spending increased",
  description: "You spent 25% more on Food this month",
  categoryChange: {
    categoryName: "Food",
    currentAmount: 500,
    previousAmount: 400,
    percentChange: 25.0,
    trend: "up",
  },
};

const mockNewMerchant: MonthlyInsight = {
  type: "new_merchant",
  title: "New merchant: Starbucks",
  description: "First time spending at Starbucks",
  newMerchant: {
    merchantName: "Starbucks",
    amount: 45.5,
    transactionCount: 3,
    categoryName: "Coffee",
  },
};

const mockIncomeChange: MonthlyInsight = {
  type: "income_change",
  title: "Income decreased",
  description: "Your income was 10% lower than last month",
  incomeChange: {
    currentAmount: 4500,
    previousAmount: 5000,
    percentChange: -10.0,
    trend: "down",
  },
};

const mockAction: RecommendedAction = {
  actionType: "uncategorized",
  title: "Categorize 15 transactions",
  description: "You have 15 uncategorized transactions worth €234.56",
  priority: 1,
};

describe("MonthlyInsightsCard", () => {
  it("renders loading state", () => {
    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[]}
          recommendedAction={null}
          isLoading={true}
        />
      </TestWrapper>,
    );

    expect(screen.getByText(/Loading insights/i)).toBeTruthy();
  });

  it("renders empty state when no data", () => {
    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[]}
          recommendedAction={null}
          isLoading={false}
        />
      </TestWrapper>,
    );

    expect(screen.getByText(/No insights available/i)).toBeTruthy();
    expect(screen.getByText(/Check back after a few transactions/i)).toBeTruthy();
  });

  it("renders insights with all 3 changes", () => {
    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[mockCategoryChange, mockNewMerchant, mockIncomeChange]}
          recommendedAction={null}
          isLoading={false}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("This Month's Insights")).toBeTruthy();
    expect(screen.getByText("3 Things That Changed")).toBeTruthy();
    expect(screen.getByText("Food spending increased")).toBeTruthy();
    expect(screen.getByText("New merchant: Starbucks")).toBeTruthy();
    expect(screen.getByText("Income decreased")).toBeTruthy();
  });

  it("renders recommended action", () => {
    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[]}
          recommendedAction={mockAction}
          isLoading={false}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("1 Action to Take This Week")).toBeTruthy();
    expect(screen.getByText("Action Recommended")).toBeTruthy();
    expect(screen.getByText("Categorize 15 transactions")).toBeTruthy();
    expect(screen.getByText("You have 15 uncategorized transactions worth €234.56")).toBeTruthy();
  });

  it("calls onInsightPress when insight is tapped", () => {
    const onInsightPress = jest.fn();

    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[mockCategoryChange]}
          recommendedAction={null}
          onInsightPress={onInsightPress}
        />
      </TestWrapper>,
    );

    const insightRow = screen.getByText("Food spending increased");
    fireEvent.press(insightRow.parent!);

    expect(onInsightPress).toHaveBeenCalledWith(mockCategoryChange);
  });

  it("calls onActionPress when action is tapped", () => {
    const onActionPress = jest.fn();

    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[]}
          recommendedAction={mockAction}
          onActionPress={onActionPress}
        />
      </TestWrapper>,
    );

    const actionCard = screen.getByText("Categorize 15 transactions");
    fireEvent.press(actionCard.parent!);

    expect(onActionPress).toHaveBeenCalledWith(mockAction);
  });

  it("formats month correctly", () => {
    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[mockCategoryChange]}
          recommendedAction={null}
        />
      </TestWrapper>,
    );

    // Should display month in Portuguese format
    expect(screen.getByText(/janeiro/i)).toBeTruthy();
  });

  it("renders category change with correct trend icon", () => {
    const upTrendChange: MonthlyInsight = {
      ...mockCategoryChange,
      categoryChange: {
        ...mockCategoryChange.categoryChange!,
        trend: "up",
      },
    };

    const { rerender } = render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[upTrendChange]}
          recommendedAction={null}
        />
      </TestWrapper>,
    );

    // Should render up trend (rendered, but icon test would need icon test lib)
    expect(screen.getByText("Food spending increased")).toBeTruthy();

    // Test down trend
    const downTrendChange: MonthlyInsight = {
      type: "category_change",
      title: "Transport spending decreased",
      description: "You spent 15% less on Transport",
      categoryChange: {
        categoryName: "Transport",
        currentAmount: 170,
        previousAmount: 200,
        percentChange: -15.0,
        trend: "down",
      },
    };

    rerender(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[downTrendChange]}
          recommendedAction={null}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Transport spending decreased")).toBeTruthy();
  });

  it("renders new merchant insight", () => {
    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[mockNewMerchant]}
          recommendedAction={null}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("New merchant: Starbucks")).toBeTruthy();
    expect(screen.getByText("First time spending at Starbucks")).toBeTruthy();
  });

  it("renders income change insight", () => {
    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[mockIncomeChange]}
          recommendedAction={null}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Income decreased")).toBeTruthy();
    expect(screen.getByText("Your income was 10% lower than last month")).toBeTruthy();
  });

  it("renders all insights and action together", () => {
    render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[mockCategoryChange, mockNewMerchant, mockIncomeChange]}
          recommendedAction={mockAction}
        />
      </TestWrapper>,
    );

    // All 3 insights
    expect(screen.getByText("Food spending increased")).toBeTruthy();
    expect(screen.getByText("New merchant: Starbucks")).toBeTruthy();
    expect(screen.getByText("Income decreased")).toBeTruthy();

    // Action
    expect(screen.getByText("Categorize 15 transactions")).toBeTruthy();
  });

  it("handles action types correctly", () => {
    const highSpendingAction: RecommendedAction = {
      actionType: "high_spending",
      title: "Review high spending",
      description: "Food category is 40% over budget",
      priority: 2,
    };

    const { rerender } = render(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[]}
          recommendedAction={highSpendingAction}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Review high spending")).toBeTruthy();

    const reviewBudgetAction: RecommendedAction = {
      actionType: "review_budget",
      title: "Review your budget",
      description: "Several categories need attention",
      priority: 3,
    };

    rerender(
      <TestWrapper>
        <MonthlyInsightsCard
          month="2025-01"
          thingsChanged={[]}
          recommendedAction={reviewBudgetAction}
        />
      </TestWrapper>,
    );

    expect(screen.getByText("Review your budget")).toBeTruthy();
  });
});
