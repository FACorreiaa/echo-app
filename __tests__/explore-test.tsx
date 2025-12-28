/**
 * Tests for the Explore screen (tabs/explore.tsx)
 */

import ExploreScreen from "@/app/(tabs)/explore";
import { render, screen } from "./test-utils";

describe("<ExploreScreen />", () => {
  test("renders explore page header", () => {
    render(<ExploreScreen />);

    expect(screen.getByText("Explore")).toBeTruthy();
  });

  test("renders search or discovery elements", () => {
    render(<ExploreScreen />);

    // Check for explore content
    expect(screen.getByText(/Discover/i)).toBeTruthy();
  });
});
