/**
 * Tests for the Dashboard/Home screen (tabs/index.tsx)
 */

import DashboardScreen from "@/app/(tabs)/index";
import { render, screen } from "./test-utils";

describe("<DashboardScreen />", () => {
  test("renders balance section", () => {
    render(<DashboardScreen />);

    expect(screen.getByText("Personal · EUR")).toBeTruthy();
    expect(screen.getByText("€7,293.40")).toBeTruthy();
  });

  test("renders quick action buttons", () => {
    render(<DashboardScreen />);

    expect(screen.getByText("Import")).toBeTruthy();
    expect(screen.getByText("Move")).toBeTruthy();
    expect(screen.getByText("Details")).toBeTruthy();
    expect(screen.getByText("More")).toBeTruthy();
  });

  test("renders promo card with Wrapped tagline", () => {
    render(<DashboardScreen />);

    expect(screen.getByText("Your Wrapped is Ready!")).toBeTruthy();
  });

  test("renders recent transactions section", () => {
    render(<DashboardScreen />);

    expect(screen.getByText("Recent Transactions")).toBeTruthy();
    expect(screen.getByText("See All")).toBeTruthy();
  });

  test("renders transaction list items", () => {
    render(<DashboardScreen />);

    expect(screen.getByText("Netflix")).toBeTruthy();
    expect(screen.getByText("Spotify")).toBeTruthy();
    expect(screen.getByText("Grocery Store")).toBeTruthy();
  });
});
