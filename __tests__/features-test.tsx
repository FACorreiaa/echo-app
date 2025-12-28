/**
 * Tests for the Features screen (public/features.tsx)
 */

import FeaturesScreen from "@/app/(public)/features";
import { render, screen } from "./test-utils";

describe("<FeaturesScreen />", () => {
  test("renders features page header", () => {
    render(<FeaturesScreen />);

    expect(screen.getByText("Features")).toBeTruthy();
  });

  test("renders feature list items", () => {
    render(<FeaturesScreen />);

    // Should render feature descriptions
    expect(screen.getByText(/Spending/i)).toBeTruthy();
  });
});
