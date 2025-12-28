/**
 * Tests for the Pricing screen (public/pricing.tsx)
 */

import PricingScreen from "@/app/(public)/pricing";
import { render, screen } from "./test-utils";

describe("<PricingScreen />", () => {
  test("renders pricing page header", () => {
    render(<PricingScreen />);

    expect(screen.getByText("Pricing")).toBeTruthy();
  });

  test("renders pricing tiers", () => {
    render(<PricingScreen />);

    // Check for pricing tier names (adjust based on actual content)
    expect(screen.getByText(/Free/i)).toBeTruthy();
  });

  test("renders pricing amounts", () => {
    render(<PricingScreen />);

    // Should show some price
    expect(screen.getByText(/€/)).toBeTruthy();
  });
});
