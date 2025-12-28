/**
 * Tests for the ImportProgress component
 */

import { ImportProgress } from "@/components/import/ImportProgress";
import { render, screen } from "./test-utils";

describe("<ImportProgress />", () => {
  test("renders importing state with spinner", () => {
    render(<ImportProgress status="importing" rowsTotal={100} rowsImported={50} rowsFailed={0} />);

    expect(screen.getByText(/Importing/i)).toBeTruthy();
  });

  test("shows progress count during import", () => {
    render(<ImportProgress status="importing" rowsTotal={100} rowsImported={75} rowsFailed={0} />);

    expect(screen.getByText(/75/)).toBeTruthy();
    expect(screen.getByText(/100/)).toBeTruthy();
  });

  test("renders success state", () => {
    render(<ImportProgress status="success" rowsTotal={100} rowsImported={100} rowsFailed={0} />);

    expect(screen.getByText(/Success/i)).toBeTruthy();
  });

  test("shows imported count on success", () => {
    render(<ImportProgress status="success" rowsTotal={100} rowsImported={98} rowsFailed={2} />);

    expect(screen.getByText(/98/)).toBeTruthy();
  });

  test("renders error state", () => {
    render(
      <ImportProgress
        status="error"
        rowsTotal={100}
        rowsImported={0}
        rowsFailed={100}
        errorMessage="Connection failed"
      />,
    );

    expect(screen.getByText(/Error/i)).toBeTruthy();
  });

  test("shows error message when provided", () => {
    render(
      <ImportProgress
        status="error"
        rowsTotal={100}
        rowsImported={0}
        rowsFailed={100}
        errorMessage="Connection failed"
      />,
    );

    expect(screen.getByText("Connection failed")).toBeTruthy();
  });
});
