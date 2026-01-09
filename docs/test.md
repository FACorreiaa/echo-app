# Testing Guide

This document outlines how to run the tests for the FinanceTrackerEcho project, specifically covering the "Edit Plan" and "Goal Setup" functionality.

## Backend Tests (EchoAPI)

The backend tests cover the service layer logic, including structural updates and goal configuration.

**Location:** `EchoAPI/internal/domain/plan/service/service_test.go`

### Running Backend Tests

Navigate to the `EchoAPI` directory and run:

```bash
cd EchoAPI
go test ./internal/domain/plan/service/...
```

To run all tests in the project:

```bash
go test ./...
```

### What is Tested
-   `UpdatePlanStructure`: Verifies that plans can be updated with new groups, categories, and items.
-   `CreatePlan` with `InitialActualMinor`: Verifies that creating a plan with pre-saved goal amounts works correctly.

## Frontend Tests (EchoApp)

The frontend tests verify the UI components and their interactions, using mock hooks to simulate API responses.

**Location:** `EchoApp/widgets/planning/__tests__/EditPlanSheet.test.tsx`

### Running Frontend Tests

Navigate to the `EchoApp` directory and run:

```bash
cd EchoApp
npm test
# Or specifically for the new tests:
npm test EditPlanSheet
```

### What is Tested
-   **Rendering**: Verifies expected groups, categories, and items are displayed.
-   **Data Mapping**: Ensures the plan data is correctly transformed for the UI builder.
-   **Interactions**: Tests that saving changes triggers the correct `useUpdatePlanStructure` mutation payload.
-   **Loading State**: Verifies loading indicators are shown while fetching data.

## Continuous Integration

These tests should be part of the CI pipeline to ensure no regressions in the planning functionality.
