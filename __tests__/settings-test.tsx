/**
 * Tests for the Settings screen (tabs/settings.tsx)
 */

import SettingsScreen from "@/app/(tabs)/settings";
import { render, screen } from "./test-utils";

describe("<SettingsScreen />", () => {
  test("renders page header", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Settings")).toBeTruthy();
  });

  test("renders profile section", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Profile")).toBeTruthy();
  });

  test("renders preferences section", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Preferences")).toBeTruthy();
  });

  test("renders theme toggle", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Dark Mode")).toBeTruthy();
  });

  test("renders logout button", () => {
    render(<SettingsScreen />);

    expect(screen.getByText("Sign Out")).toBeTruthy();
  });
});
