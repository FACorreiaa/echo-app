/**
 * Tests for the Spend screen (tabs/spend.tsx)
 */

import SpendScreen from "@/app/(tabs)/spend";
import { render, screen } from "./test-utils";

describe("<SpendScreen />", () => {
  test("renders page header", () => {
    render(<SpendScreen />);

    expect(screen.getByText("Spending")).toBeTruthy();
  });

  test("renders month navigation", () => {
    render(<SpendScreen />);

    expect(screen.getByText("December 2024")).toBeTruthy();
  });

  test("renders total spent amount", () => {
    render(<SpendScreen />);

    expect(screen.getByText("€1,245.87")).toBeTruthy();
    expect(screen.getByText("Total Spent")).toBeTruthy();
  });

  test("renders spending categories", () => {
    render(<SpendScreen />);

    expect(screen.getByText("Food & Drinks")).toBeTruthy();
    expect(screen.getByText("Shopping")).toBeTruthy();
    expect(screen.getByText("Entertainment")).toBeTruthy();
  });

  test("renders transaction list", () => {
    render(<SpendScreen />);

    // Check for specific transactions
    expect(screen.getByText("Bolt Food")).toBeTruthy();
  });
});
