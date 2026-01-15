/**
 * EditBudgetSheet - Interactive bottom sheet for editing budget categories
 *
 * Features:
 * - Monthly limit slider with visual feedback
 * - Category name editing
 * - Real-time budget preview
 * - Changes budget items within a plan
 */

import { Save } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, Input, Label, Sheet, Slider, Text, XStack, YStack } from "tamagui";

import type { PlanItem } from "@/lib/hooks/use-plans";
import { useUpdatePlan } from "@/lib/hooks/use-plans";

// ============================================================================
// Types
// ============================================================================

export interface EditBudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  item: PlanItem | null;
  onBudgetUpdated?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function EditBudgetSheet({
  open,
  onOpenChange,
  planId,
  item,
  onBudgetUpdated,
}: EditBudgetSheetProps) {
  // Form state
  const [name, setName] = useState("");
  const [budgeted, setBudgeted] = useState(0);

  // Mutations
  const updatePlan = useUpdatePlan();

  // Computed
  const isLoading = updatePlan.isPending;
  const maxBudget = Math.max(budgeted * 2, 1000); // Allow slider up to 2x current or min 1000

  // Sync form state with item prop
  useEffect(() => {
    if (item) {
      setName(item.name);
      setBudgeted(item.budgeted);
    }
  }, [item]);

  const handleSave = async () => {
    if (!item || !planId) return;

    try {
      await updatePlan.mutateAsync({
        planId,
        items: [{ itemId: item.id, budgetedMinor: Math.round(budgeted * 100) }],
      });

      onBudgetUpdated?.();
      onOpenChange(false);
    } catch {
      Alert.alert("Error", "Failed to update budget. Please try again.");
    }
  };

  if (!item) return null;

  // Calculate if over budget
  const isOverBudget = item.actual > budgeted;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[75]}
      dismissOnSnapToBottom
      position={0}
      modal
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame padding="$4" gap="$5" backgroundColor="$background">
        <Sheet.Handle />

        {/* Header */}
        <YStack alignItems="center" gap="$2">
          <Text fontSize={24} fontWeight="900" fontFamily="$heading">
            Edit Budget
          </Text>
          <Text color="$secondaryText" fontFamily="$body">
            Adjust your monthly limit for "{item.name}"
          </Text>
        </YStack>

        {/* Budget Preview Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <YStack backgroundColor="$backgroundHover" padding="$5" borderRadius="$6" gap="$4">
            <XStack justifyContent="space-between" alignItems="baseline">
              <YStack>
                <Text fontSize={12} color="$secondaryText">
                  Spent this month
                </Text>
                <Text
                  fontSize={24}
                  fontWeight="bold"
                  color={isOverBudget ? "$red10" : "$color"}
                  fontFamily="$heading"
                >
                  €{item.actual.toLocaleString()}
                </Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text fontSize={12} color="$secondaryText">
                  Monthly Limit
                </Text>
                <Text fontSize={24} fontWeight="bold" color="$blue10" fontFamily="$heading">
                  €{budgeted.toLocaleString()}
                </Text>
              </YStack>
            </XStack>

            {/* Budget Slider */}
            <YStack gap="$2">
              <Text fontSize={12} color="$secondaryText">
                Adjust Monthly Limit
              </Text>
              <Slider
                size="$4"
                width="100%"
                value={[budgeted]}
                max={maxBudget}
                step={10}
                onValueChange={([val]) => setBudgeted(val)}
              >
                <Slider.Track backgroundColor="$backgroundHover">
                  <Slider.TrackActive backgroundColor="$blue10" />
                </Slider.Track>
                <Slider.Thumb
                  index={0}
                  circular
                  elevate
                  backgroundColor="white"
                  borderWidth={2}
                  borderColor="$blue10"
                />
              </Slider>
              <XStack justifyContent="space-between">
                <Text fontSize={12} color="$secondaryText">
                  €0
                </Text>
                <Text fontSize={12} color="$secondaryText">
                  €{maxBudget.toLocaleString()}
                </Text>
              </XStack>
            </YStack>

            {/* Status Indicator */}
            {isOverBudget && (
              <XStack
                backgroundColor="rgba(239, 68, 68, 0.1)"
                padding="$3"
                borderRadius="$4"
                gap="$2"
                alignItems="center"
              >
                <Text color="$red10" fontSize={14}>
                  ⚠️ You've exceeded this budget by €{(item.actual - budgeted).toLocaleString()}
                </Text>
              </XStack>
            )}
          </YStack>
        </MotiView>

        {/* Category Name (Read-only for now) */}
        <YStack gap="$2">
          <Label fontWeight="600" fontFamily="$body">
            Category Name
          </Label>
          <Input size="$5" value={name} onChangeText={setName} editable={false} />
        </YStack>

        {/* Actions */}
        <YStack gap="$3" marginTop="$2">
          <Button
            themeInverse
            size="$5"
            fontWeight="bold"
            icon={Save}
            onPress={handleSave}
            disabled={isLoading}
            opacity={isLoading ? 0.6 : 1}
          >
            {updatePlan.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
