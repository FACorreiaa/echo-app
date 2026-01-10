import config from "@/tamagui.config";
import { render, screen } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";
import PrivacyScreen from "../privacy";

// Mock dependencies
jest.mock("@/components", () => ({
  GlassyCard: ({ children }: any) => <>{children}</>,
  GradientBackground: ({ children }: any) => <>{children}</>,
  Avatar: () => null,
}));
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0 }),
}));

const renderWithTheme = (component: React.ReactNode) => {
  return render(<TamaguiProvider config={config}>{component}</TamaguiProvider>);
};

describe("PrivacyScreen", () => {
  it("renders all privacy pillars and export button", () => {
    renderWithTheme(<PrivacyScreen />);

    expect(screen.getByText("Your Data. Your Terms.")).toBeTruthy();
    expect(screen.getByText("Read-Only Promise")).toBeTruthy();
    expect(screen.getByText("Local Encryption")).toBeTruthy();
    expect(screen.getByText("No Data Silos")).toBeTruthy();
    expect(screen.getByText("Export Your Data")).toBeTruthy();
  });
});
