/**
 * Tests for the MappingWizard component
 */

import { MappingWizard } from "@/components/import/MappingWizard";
import type { FileAnalysis } from "@/lib/hooks/use-import";
import { fireEvent, render, screen } from "./test-utils";

const mockAnalysis: FileAnalysis = {
  headers: ["Date", "Description", "Amount", "Category"],
  sampleRows: [
    ["2024-12-01", "Coffee Shop", "5.50", "Food"],
    ["2024-12-02", "Grocery Store", "45.23", "Food"],
    ["2024-12-03", "Netflix", "12.99", "Entertainment"],
  ],
  delimiter: ",",
  skipLines: 0,
  fingerprint: "date|description|amount|category",
  suggestions: {
    dateCol: 0,
    descCol: 1,
    amountCol: 2,
    debitCol: -1,
    creditCol: -1,
    categoryCol: 3,
    isDoubleEntry: false,
  },
  probedDialect: {
    isEuropeanFormat: false,
    dateFormat: "YYYY-MM-DD",
    confidence: 0.9,
  },
  mappingFound: false,
  canAutoImport: false,
};

describe("<MappingWizard />", () => {
  const mockOnComplete = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders file preview section", () => {
    render(
      <MappingWizard
        analysis={mockAnalysis}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByText("File Preview")).toBeTruthy();
  });

  test("renders column mapping section", () => {
    render(
      <MappingWizard
        analysis={mockAnalysis}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Column Mapping")).toBeTruthy();
  });

  test("shows header columns from analysis", () => {
    render(
      <MappingWizard
        analysis={mockAnalysis}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    // Headers should appear in preview
    expect(screen.getByText("Date")).toBeTruthy();
    expect(screen.getByText("Description")).toBeTruthy();
  });

  test("renders cancel button", () => {
    render(
      <MappingWizard
        analysis={mockAnalysis}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Cancel")).toBeTruthy();
  });

  test("renders import button", () => {
    render(
      <MappingWizard
        analysis={mockAnalysis}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    expect(screen.getByText("Import")).toBeTruthy();
  });

  test("cancel button calls onCancel", () => {
    render(
      <MappingWizard
        analysis={mockAnalysis}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        isLoading={false}
      />,
    );

    const cancelButton = screen.getByText("Cancel");
    fireEvent.press(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test("shows loading state when isLoading is true", () => {
    render(
      <MappingWizard
        analysis={mockAnalysis}
        onComplete={mockOnComplete}
        onCancel={mockOnCancel}
        isLoading={true}
      />,
    );

    // Button should show loading indicator or be disabled
    expect(screen.getByText("Importing...")).toBeTruthy();
  });
});
