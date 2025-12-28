/**
 * Tests for the Login screen (auth/login.tsx)
 */

import LoginScreen from "@/app/(auth)/login";
import { fireEvent, render, screen } from "./test-utils";

describe("<LoginScreen />", () => {
  test("renders login form header", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Welcome Back")).toBeTruthy();
  });

  test("renders email input", () => {
    render(<LoginScreen />);

    expect(screen.getByPlaceholderText(/email/i)).toBeTruthy();
  });

  test("renders password input", () => {
    render(<LoginScreen />);

    expect(screen.getByPlaceholderText(/password/i)).toBeTruthy();
  });

  test("renders login button", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Sign In")).toBeTruthy();
  });

  test("renders register link", () => {
    render(<LoginScreen />);

    expect(screen.getByText(/Don't have an account/)).toBeTruthy();
  });

  test("login button is pressable", () => {
    render(<LoginScreen />);

    const button = screen.getByText("Sign In");
    expect(button).toBeTruthy();

    // Should not throw when pressed
    fireEvent.press(button);
  });
});
