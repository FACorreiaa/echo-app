/**
 * EditableItemRow - Item row with inline editing capability
 *
 * Features:
 * - Long-press to enter edit mode
 * - Save on blur or submit
 * - Visual feedback during edit and save
 */

import { Check, Pencil, X } from "@tamagui/lucide-icons";
import React, { useCallback, useRef, useState } from "react";
import { Pressable, TextInput } from "react-native";
import { Input, Spinner, Text, XStack, YStack } from "tamagui";

import type { BudgetItem } from "./CategoryDetailCard";

interface EditableItemRowProps {
  item: BudgetItem;
  currencyCode?: string;
  onSave?: (item: BudgetItem, updates: { name?: string; budgetedMinor?: number }) => Promise<void>;
  onPress?: () => void;
}

// Format currency for display
function formatCurrency(amountMinor: number, currencyCode = "EUR"): string {
  const amount = amountMinor / 100;
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Get progress color based on percentage
function getProgressColor(percentage: number): string {
  if (percentage <= 60) return "#22c55e";
  if (percentage <= 85) return "#f59e0b";
  return "#ef4444";
}

export function EditableItemRow({
  item,
  currencyCode = "EUR",
  onSave,
  onPress,
}: EditableItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editBudget, setEditBudget] = useState(String(item.budgetedMinor / 100));
  const [saveSuccess, setSaveSuccess] = useState(false);

  const nameInputRef = useRef<TextInput>(null);

  const itemPercentage =
    item.budgetedMinor > 0 && item.actualMinor ? (item.actualMinor / item.budgetedMinor) * 100 : 0;
  const itemColor = getProgressColor(itemPercentage);

  const enterEditMode = useCallback(() => {
    setEditName(item.name);
    setEditBudget(String(item.budgetedMinor / 100));
    setIsEditing(true);
    // Focus input after state update
    setTimeout(() => nameInputRef.current?.focus(), 100);
  }, [item.name, item.budgetedMinor]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditName(item.name);
    setEditBudget(String(item.budgetedMinor / 100));
  }, [item.name, item.budgetedMinor]);

  const handleSave = useCallback(async () => {
    if (!onSave) {
      setIsEditing(false);
      return;
    }

    const newBudgetMinor = Math.round(parseFloat(editBudget || "0") * 100);
    const hasNameChanged = editName.trim() !== item.name;
    const hasBudgetChanged = newBudgetMinor !== item.budgetedMinor;

    if (!hasNameChanged && !hasBudgetChanged) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(item, {
        name: hasNameChanged ? editName.trim() : undefined,
        budgetedMinor: hasBudgetChanged ? newBudgetMinor : undefined,
      });
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
    } catch (error) {
      console.error("Failed to save item:", error);
      // Keep in edit mode on error
    } finally {
      setIsSaving(false);
    }
  }, [editName, editBudget, item, onSave]);

  // Edit Mode UI
  if (isEditing) {
    return (
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingVertical="$2"
        paddingHorizontal="$1"
        backgroundColor="rgba(99, 102, 241, 0.1)"
        borderRadius="$2"
        gap="$2"
      >
        {/* Name Input */}
        <Input
          ref={nameInputRef as any}
          flex={1}
          value={editName}
          onChangeText={setEditName}
          onSubmitEditing={handleSave}
          size="$3"
          backgroundColor="$background"
          borderColor="$accentColor"
          borderWidth={1}
          autoFocus
          testID="item-name-input"
        />

        {/* Budget Input */}
        <XStack alignItems="center" gap="$1" width={80}>
          <Text color="$secondaryText" fontSize={12}>
            €
          </Text>
          <Input
            value={editBudget}
            onChangeText={setEditBudget}
            onSubmitEditing={handleSave}
            size="$3"
            width={60}
            keyboardType="decimal-pad"
            textAlign="right"
            backgroundColor="$background"
            borderColor="$accentColor"
            borderWidth={1}
            testID="item-budget-input"
          />
        </XStack>

        {/* Action Buttons */}
        <XStack gap="$1">
          {isSaving ? (
            <Spinner size="small" color="$accentColor" />
          ) : (
            <>
              <Pressable onPress={handleSave} testID="save-button">
                <YStack backgroundColor="$green10" padding="$1.5" borderRadius="$2">
                  <Check size={14} color="white" />
                </YStack>
              </Pressable>
              <Pressable onPress={cancelEdit} testID="cancel-button">
                <YStack backgroundColor="$red10" padding="$1.5" borderRadius="$2">
                  <X size={14} color="white" />
                </YStack>
              </Pressable>
            </>
          )}
        </XStack>
      </XStack>
    );
  }

  // View Mode UI
  return (
    <Pressable
      onPress={onPress}
      onLongPress={enterEditMode}
      delayLongPress={400}
      testID={`item-row-${item.id}`}
    >
      <XStack
        justifyContent="space-between"
        alignItems="center"
        paddingVertical="$1"
        backgroundColor={saveSuccess ? "rgba(34, 197, 94, 0.1)" : "transparent"}
        borderRadius="$2"
        paddingHorizontal="$1"
      >
        <YStack flex={1}>
          <XStack alignItems="center" gap="$2">
            <Text color="$color" fontSize={13}>
              {item.name}
            </Text>
            {/* Edit indicator - visible on hover (web) */}
            <Pencil size={12} color="$secondaryText" opacity={0.5} />
          </XStack>
          {item.actualMinor !== undefined && (
            <XStack gap="$2">
              <Text color="$secondaryText" fontSize={11}>
                {formatCurrency(item.actualMinor, currencyCode)}
              </Text>
              <Text color={itemColor as any} fontSize={11}>
                ({itemPercentage.toFixed(0)}%)
              </Text>
            </XStack>
          )}
        </YStack>
        <XStack alignItems="center" gap="$2">
          <Text color="$secondaryText" fontSize={13}>
            {formatCurrency(item.budgetedMinor, currencyCode)}
          </Text>
          {saveSuccess && <Check size={14} color="$green10" />}
        </XStack>
      </XStack>
    </Pressable>
  );
}
