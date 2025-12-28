/**
 * Tests for the About screen (public/about.tsx)
 */

import AboutScreen from "@/app/(public)/about";
import { render, screen } from "./test-utils";

describe("<AboutScreen />", () => {
  test("renders about page header", () => {
    render(<AboutScreen />);

    expect(screen.getByText("About")).toBeTruthy();
  });

  test("renders company description", () => {
    render(<AboutScreen />);

    // Check for about content
    expect(screen.getByText(/Echo/i)).toBeTruthy();
  });
});
