/**
 * Tests for the Register screen (auth/register.tsx)
 */

import RegisterScreen from "@/app/(auth)/register";
import { fireEvent, render, screen } from "./test-utils";

describe("<RegisterScreen />", () => {
  test("renders register form header", () => {
    render(<RegisterScreen />);

    expect(screen.getByText("Create Account")).toBeTruthy();
  });

  test("renders email input", () => {
    render(<RegisterScreen />);

    expect(screen.getByPlaceholderText(/email/i)).toBeTruthy();
  });

  test("renders password input", () => {
    render(<RegisterScreen />);

    expect(screen.getByPlaceholderText(/password/i)).toBeTruthy();
  });

  test("renders username input", () => {
    render(<RegisterScreen />);

    expect(screen.getByPlaceholderText(/username/i)).toBeTruthy();
  });

  test("renders sign up button", () => {
    render(<RegisterScreen />);

    expect(screen.getByText("Sign Up")).toBeTruthy();
  });

  test("renders login link", () => {
    render(<RegisterScreen />);

    expect(screen.getByText(/Already have an account/)).toBeTruthy();
  });

  test("sign up button is pressable", () => {
    render(<RegisterScreen />);

    const button = screen.getByText("Sign Up");
    expect(button).toBeTruthy();

    fireEvent.press(button);
  });
});
