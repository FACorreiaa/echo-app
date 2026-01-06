/**
 * Tests for plan dashboard components
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

// Mock Victory Native (Skia-based) - MUST be before imports
jest.mock("victory-native", () => ({
  CartesianChart: ({ children }: { children: React.ReactNode }) => children,
  Bar: () => null,
  useChartPressState: () => ({ state: {}, isActive: false }),
}));

jest.mock("@shopify/react-native-skia", () => ({
  Circle: () => null,
  useFont: () => null,
}));

import { render } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";

import config from "@/tamagui.config";

import {
  CATEGORY_COLORS,
  CategoryDetailCard,
  CategorySpendingChart,
  GoalActualProgress,
  calculatePillarsFromGroups,
  generateMonths,
} from "../index";

// Test wrapper with Tamagui provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
);

describe("CategorySpendingChart", () => {
  const mockData = [
    { id: "1", name: "Housing", budgetedMinor: 100000, color: "#3b82f6" },
    { id: "2", name: "Food", budgetedMinor: 50000, color: "#22c55e" },
    { id: "3", name: "Transport", budgetedMinor: 20000, color: "#f59e0b" },
  ];

  it("renders without crashing", () => {
    const { getByText } = render(
      <TestWrapper>
        <CategorySpendingChart data={mockData} />
      </TestWrapper>,
    );
    expect(getByText("Para onde vai o meu dinheiro?")).toBeTruthy();
  });

  it("shows empty state when no data", () => {
    const { getByText } = render(
      <TestWrapper>
        <CategorySpendingChart data={[]} />
      </TestWrapper>,
    );
    expect(getByText("No spending data available")).toBeTruthy();
  });

  it("displays total budget", () => {
    const { getByText } = render(
      <TestWrapper>
        <CategorySpendingChart data={mockData} currencyCode="EUR" />
      </TestWrapper>,
    );
    // Total: 1000 + 500 + 200 = 1700 EUR
    expect(getByText(/1.*700.*total/)).toBeTruthy();
  });

  it("shows category names in legend", () => {
    const { getByText } = render(
      <TestWrapper>
        <CategorySpendingChart data={mockData} />
      </TestWrapper>,
    );
    expect(getByText("Housing")).toBeTruthy();
    expect(getByText("Food")).toBeTruthy();
    expect(getByText("Transport")).toBeTruthy();
  });
});

describe("CategoryDetailCard", () => {
  const mockCategory = {
    id: "1",
    name: "Housing",
    color: "#3b82f6",
    budgetedMinor: 150000, // 1500 EUR
    actualMinor: 120000, // 1200 EUR = 80%
    items: [
      { id: "1a", name: "Rent", budgetedMinor: 100000, actualMinor: 100000 },
      { id: "1b", name: "Utilities", budgetedMinor: 50000, actualMinor: 20000 },
    ],
  };

  it("renders category name", () => {
    const { getByText } = render(
      <TestWrapper>
        <CategoryDetailCard category={mockCategory} />
      </TestWrapper>,
    );
    expect(getByText("Housing")).toBeTruthy();
  });

  it("shows budget used percentage", () => {
    const { getByText } = render(
      <TestWrapper>
        <CategoryDetailCard category={mockCategory} />
      </TestWrapper>,
    );
    // 1200/1500 = 80%
    expect(getByText("80% usado")).toBeTruthy();
  });

  it("shows remaining amount", () => {
    const { getByText } = render(
      <TestWrapper>
        <CategoryDetailCard category={mockCategory} currencyCode="EUR" />
      </TestWrapper>,
    );
    // 1500 - 1200 = 300 EUR remaining
    expect(getByText(/300.*restante/)).toBeTruthy();
  });
});

describe("GoalActualProgress", () => {
  const mockPillars = [
    {
      id: "1",
      name: "Essentials",
      goalPercentage: 60,
      actualPercentage: 45,
      budgetedMinor: 180000,
      actualMinor: 135000,
      color: "#3b82f6",
    },
    {
      id: "2",
      name: "Fun",
      goalPercentage: 20,
      actualPercentage: 18,
      budgetedMinor: 60000,
      actualMinor: 54000,
      color: "#22c55e",
    },
  ];

  it("renders pillar names", () => {
    const { getByText } = render(
      <TestWrapper>
        <GoalActualProgress pillars={mockPillars} totalIncomeMinor={300000} />
      </TestWrapper>,
    );
    expect(getByText("Essentials")).toBeTruthy();
    expect(getByText("Fun")).toBeTruthy();
  });

  it("shows goal percentages", () => {
    const { getByText } = render(
      <TestWrapper>
        <GoalActualProgress pillars={mockPillars} totalIncomeMinor={300000} />
      </TestWrapper>,
    );
    expect(getByText("Meta: 60%")).toBeTruthy();
    expect(getByText("Meta: 20%")).toBeTruthy();
  });

  it("renders section title", () => {
    const { getByText } = render(
      <TestWrapper>
        <GoalActualProgress pillars={mockPillars} totalIncomeMinor={300000} />
      </TestWrapper>,
    );
    expect(getByText("Meta vs Real")).toBeTruthy();
  });
});

describe("calculatePillarsFromGroups", () => {
  const mockGroups = [
    {
      id: "g1",
      name: "Essentials",
      targetPercent: 60,
      color: "#3b82f6",
      categories: [
        {
          items: [
            { budgetedMinor: 100000, actualMinor: 80000 },
            { budgetedMinor: 50000, actualMinor: 40000 },
          ],
        },
      ],
    },
  ];

  it("calculates total budgeted from items", () => {
    const pillars = calculatePillarsFromGroups(mockGroups, 300000);
    expect(pillars[0].budgetedMinor).toBe(150000);
  });

  it("calculates total actual from items", () => {
    const pillars = calculatePillarsFromGroups(mockGroups, 300000);
    expect(pillars[0].actualMinor).toBe(120000);
  });

  it("calculates actual percentage of income", () => {
    const pillars = calculatePillarsFromGroups(mockGroups, 300000);
    // 120000 / 300000 = 40%
    expect(pillars[0].actualPercentage).toBe(40);
  });

  it("preserves goal percentage", () => {
    const pillars = calculatePillarsFromGroups(mockGroups, 300000);
    expect(pillars[0].goalPercentage).toBe(60);
  });
});

describe("generateMonths", () => {
  it("generates 12 months by default", () => {
    const months = generateMonths(new Date(2026, 0, 1));
    expect(months).toHaveLength(12);
  });

  it("starts from the given date", () => {
    const months = generateMonths(new Date(2026, 0, 1));
    expect(months[0]).toMatch(/jan.*26/i);
  });

  it("generates sequential months", () => {
    const months = generateMonths(new Date(2026, 0, 1), 3);
    expect(months[0]).toMatch(/jan/i);
    expect(months[1]).toMatch(/fev/i);
    expect(months[2]).toMatch(/mar/i);
  });

  it("respects count parameter", () => {
    const months = generateMonths(new Date(), 6);
    expect(months).toHaveLength(6);
  });
});

describe("CATEGORY_COLORS", () => {
  it("has 10 colors", () => {
    expect(CATEGORY_COLORS).toHaveLength(10);
  });

  it("all colors are valid hex", () => {
    CATEGORY_COLORS.forEach((color) => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});
