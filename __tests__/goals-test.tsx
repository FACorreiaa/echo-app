/**
 * Tests for the Goals screen (tabs/goals.tsx)
 */

import GoalsScreen from "@/app/(tabs)/goals";
import { render, screen } from "./test-utils";

describe("<GoalsScreen />", () => {
  test("renders page header", () => {
    render(<GoalsScreen />);

    expect(screen.getByText("Goals")).toBeTruthy();
  });

  test("renders goals summary section", () => {
    render(<GoalsScreen />);

    expect(screen.getByText("Active Goals")).toBeTruthy();
    expect(screen.getByText("Total Saved")).toBeTruthy();
  });

  test("renders example goal cards", () => {
    render(<GoalsScreen />);

    // Check for goal items (adjust based on actual mock data)
    expect(screen.getByText("Emergency Fund")).toBeTruthy();
    expect(screen.getByText("Vacation")).toBeTruthy();
  });

  test("renders add goal button", () => {
    render(<GoalsScreen />);

    expect(screen.getByText("Add Goal")).toBeTruthy();
  });
});
