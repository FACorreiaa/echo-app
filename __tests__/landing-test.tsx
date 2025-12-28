/**
 * Tests for the Landing/Home screen (public/index.tsx)
 */

import LandingScreen from "@/app/(public)/index";
import { render, screen } from "./test-utils";

describe("<LandingScreen />", () => {
  test("renders Echo branding", () => {
    render(<LandingScreen />);

    expect(screen.getByText("Echo")).toBeTruthy();
  });

  test("renders hero tagline", () => {
    render(<LandingScreen />);

    // Check for hero text (adjust based on actual content)
    expect(screen.getByText(/Finance/i)).toBeTruthy();
  });

  test("renders call to action buttons", () => {
    render(<LandingScreen />);

    // Check for CTA buttons
    expect(screen.getByText("Get Started")).toBeTruthy();
  });

  test("renders feature highlights", () => {
    render(<LandingScreen />);

    // Should have some feature text
    expect(screen.getByText(/Track/i)).toBeTruthy();
  });
});
