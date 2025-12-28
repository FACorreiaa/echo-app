/**
 * Tests for the Import screen (tabs/import.tsx)
 */

import ImportScreen from "@/app/(tabs)/import";
import { fireEvent, render, screen } from "./test-utils";

describe("<ImportScreen />", () => {
  test("renders page header", () => {
    render(<ImportScreen />);

    expect(screen.getByText("Import Transactions")).toBeTruthy();
    expect(screen.getByText("Add your bank data manually")).toBeTruthy();
  });

  test("renders upload section with icon", () => {
    render(<ImportScreen />);

    expect(screen.getByText("Upload CSV / TSV")).toBeTruthy();
    expect(screen.getByText(/Select a bank statement file/)).toBeTruthy();
  });

  test("renders file select button", () => {
    render(<ImportScreen />);

    expect(screen.getByText("Select File")).toBeTruthy();
  });

  test("renders supported banks list", () => {
    render(<ImportScreen />);

    expect(screen.getByText("Supported Banks")).toBeTruthy();
    expect(screen.getByText("Revolut")).toBeTruthy();
    expect(screen.getByText("Caixa Geral")).toBeTruthy();
    expect(screen.getByText("Santander")).toBeTruthy();
    expect(screen.getByText("Millennium")).toBeTruthy();
    expect(screen.getByText("ActivoBank")).toBeTruthy();
  });

  test("select file button is pressable", () => {
    render(<ImportScreen />);

    const button = screen.getByText("Select File");
    expect(button).toBeTruthy();

    // Should not throw when pressed
    fireEvent.press(button);
  });
});
