/**
 * Tests for the Insights screen (tabs/insights.tsx)
 */

import InsightsScreen from "@/app/(tabs)/insights";
import { render, screen } from "./test-utils";

describe("<InsightsScreen />", () => {
  test("renders page header", () => {
    render(<InsightsScreen />);

    expect(screen.getByText("Insights")).toBeTruthy();
  });

  test("renders insight cards", () => {
    render(<InsightsScreen />);

    // Check for insight sections
    expect(screen.getByText("Spending Trends")).toBeTruthy();
  });

  test("renders time period selector", () => {
    render(<InsightsScreen />);

    // Check for period options
    expect(screen.getByText("This Month")).toBeTruthy();
  });

  test("renders category breakdown", () => {
    render(<InsightsScreen />);

    expect(screen.getByText("Top Categories")).toBeTruthy();
  });
});
