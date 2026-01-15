/**
 * EditableItemRow Component Tests
 *
 * Tests inline editing functionality:
 * - Long-press enters edit mode
 * - Name and budget can be edited
 * - Save calls onSave with correct updates
 * - Cancel reverts to original values
 * - Visual feedback on save success
 */

import { fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { TamaguiProvider } from "tamagui";

import tamaguiConfig from "@/tamagui.config";

import { EditableItemRow } from "../EditableItemRow";

// Test wrapper with Tamagui provider
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TamaguiProvider config={tamaguiConfig}>{children}</TamaguiProvider>
);

// Mock item data
const mockItem = {
  id: "item-1",
  name: "Groceries",
  budgetedMinor: 50000, // €500
  actualMinor: 35000, // €350
};

describe("EditableItemRow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("View Mode", () => {
    it("renders item name and budget correctly", () => {
      const { getByText } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} />
        </TestWrapper>,
      );

      expect(getByText("Groceries")).toBeTruthy();
      expect(getByText(/500/)).toBeTruthy(); // €500 budgeted
    });

    it("shows actual amount and percentage when available", () => {
      const { getByText } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} />
        </TestWrapper>,
      );

      expect(getByText(/350/)).toBeTruthy(); // €350 actual
      expect(getByText(/70%/)).toBeTruthy(); // 70% usage
    });

    it("calls onPress when tapped", () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onPress={onPress} />
        </TestWrapper>,
      );

      fireEvent.press(getByTestId(`item-row-${mockItem.id}`));
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe("Enter Edit Mode", () => {
    it("enters edit mode on long-press", async () => {
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={jest.fn()} />
        </TestWrapper>,
      );

      // Initially in view mode
      expect(queryByTestId("item-name-input")).toBeNull();

      // Long-press to enter edit mode
      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      // Now should show inputs
      await waitFor(() => {
        expect(queryByTestId("item-name-input")).toBeTruthy();
        expect(queryByTestId("item-budget-input")).toBeTruthy();
      });
    });

    it("shows save and cancel buttons in edit mode", async () => {
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={jest.fn()} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        expect(queryByTestId("save-button")).toBeTruthy();
        expect(queryByTestId("cancel-button")).toBeTruthy();
      });
    });
  });

  describe("Editing", () => {
    it("updates name in input field", async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={jest.fn()} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        const nameInput = getByTestId("item-name-input");
        fireEvent.changeText(nameInput, "Weekly Groceries");
        expect(nameInput.props.value).toBe("Weekly Groceries");
      });
    });

    it("updates budget in input field", async () => {
      const { getByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={jest.fn()} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        const budgetInput = getByTestId("item-budget-input");
        fireEvent.changeText(budgetInput, "600");
        expect(budgetInput.props.value).toBe("600");
      });
    });
  });

  describe("Save", () => {
    it("calls onSave with updated name", async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={onSave} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        const nameInput = getByTestId("item-name-input");
        fireEvent.changeText(nameInput, "Weekly Groceries");
      });

      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(mockItem, {
          name: "Weekly Groceries",
          budgetedMinor: undefined, // Budget unchanged
        });
      });
    });

    it("calls onSave with updated budget", async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={onSave} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        const budgetInput = getByTestId("item-budget-input");
        fireEvent.changeText(budgetInput, "600");
      });

      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(mockItem, {
          name: undefined, // Name unchanged
          budgetedMinor: 60000, // €600 in minor units
        });
      });
    });

    it("calls onSave with both name and budget when both changed", async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { getByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={onSave} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        fireEvent.changeText(getByTestId("item-name-input"), "Weekly Groceries");
        fireEvent.changeText(getByTestId("item-budget-input"), "600");
      });

      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(mockItem, {
          name: "Weekly Groceries",
          budgetedMinor: 60000,
        });
      });
    });

    it("exits edit mode after successful save", async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={onSave} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        expect(queryByTestId("item-name-input")).toBeTruthy();
      });

      fireEvent.changeText(getByTestId("item-name-input"), "New Name");
      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(queryByTestId("item-name-input")).toBeNull();
      });
    });

    it("does not call onSave when no changes made", async () => {
      const onSave = jest.fn().mockResolvedValue(undefined);
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={onSave} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        expect(queryByTestId("save-button")).toBeTruthy();
      });

      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(onSave).not.toHaveBeenCalled();
      });
    });
  });

  describe("Cancel", () => {
    it("exits edit mode without saving on cancel", async () => {
      const onSave = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={onSave} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        fireEvent.changeText(getByTestId("item-name-input"), "New Name");
      });

      fireEvent.press(getByTestId("cancel-button"));

      await waitFor(() => {
        expect(queryByTestId("item-name-input")).toBeNull();
        expect(onSave).not.toHaveBeenCalled();
      });
    });

    it("reverts to original values after cancel", async () => {
      const { getByTestId, getByText, queryByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={jest.fn()} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        fireEvent.changeText(getByTestId("item-name-input"), "Changed Name");
      });

      fireEvent.press(getByTestId("cancel-button"));

      await waitFor(() => {
        expect(queryByTestId("item-name-input")).toBeNull();
        // Original name should be displayed
        expect(getByText("Groceries")).toBeTruthy();
      });
    });
  });

  describe("Error Handling", () => {
    it("stays in edit mode when save fails", async () => {
      const onSave = jest.fn().mockRejectedValue(new Error("Network error"));
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      const { getByTestId, queryByTestId } = render(
        <TestWrapper>
          <EditableItemRow item={mockItem} onSave={onSave} />
        </TestWrapper>,
      );

      fireEvent(getByTestId(`item-row-${mockItem.id}`), "longPress");

      await waitFor(() => {
        fireEvent.changeText(getByTestId("item-name-input"), "New Name");
      });

      fireEvent.press(getByTestId("save-button"));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalled();
        // Should still be in edit mode
        expect(queryByTestId("item-name-input")).toBeTruthy();
      });

      consoleSpy.mockRestore();
    });
  });
});
