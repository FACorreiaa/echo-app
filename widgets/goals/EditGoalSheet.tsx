/**
 * EditGoalSheet - Interactive bottom sheet for editing existing goals
 *
 * Features:
 * - Interactive progress slider
 * - Target amount input
 * - Deadline date picker
 * - Real-time progress preview
 * - Delete confirmation
 */

import { Calendar, Save, Trash2 } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, Input, Label, Sheet, Slider, Text, Theme, XStack, YStack } from "tamagui";

import type { Goal } from "@/lib/hooks/use-goals";
import { useDeleteGoal, useUpdateGoal } from "@/lib/hooks/use-goals";

// ============================================================================
// Types
// ============================================================================

export interface EditGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onGoalUpdated?: () => void;
  onGoalDeleted?: () => void;
}

// ============================================================================
// Component
// ============================================================================

export function EditGoalSheet({
  open,
  onOpenChange,
  goal,
  onGoalUpdated,
  onGoalDeleted,
}: EditGoalSheetProps) {
  // Form state
  const [name, setName] = useState("");
  const [target, setTarget] = useState(0);
  const [current, setCurrent] = useState(0);

  // Mutations
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();

  // Computed
  const progress = target > 0 ? (current / target) * 100 : 0;
  const isLoading = updateGoal.isPending || deleteGoal.isPending;

  // Sync form state with goal prop
  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTarget(goal.target);
      setCurrent(goal.current);
    }
  }, [goal]);

  const handleSave = async () => {
    if (!goal) return;

    try {
      await updateGoal.mutateAsync({
        goalId: goal.id,
        name: name !== goal.name ? name : undefined,
        target: target !== goal.target ? target : undefined,
      });

      onGoalUpdated?.();
      onOpenChange(false);
    } catch {
      Alert.alert("Error", "Failed to update goal. Please try again.");
    }
  };

  const handleDelete = () => {
    if (!goal) return;

    Alert.alert(
      "Delete Goal",
      `Are you sure you want to delete "${goal.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGoal.mutateAsync(goal.id);
              onGoalDeleted?.();
              onOpenChange(false);
            } catch {
              Alert.alert("Error", "Failed to delete goal. Please try again.");
            }
          },
        },
      ],
    );
  };

  if (!goal) return null;

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85]}
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
            Edit Goal
          </Text>
          <Text color="$secondaryText" fontFamily="$body">
            Adjust your "{goal.name}" progress
          </Text>
        </YStack>

        {/* Interactive Progress Preview */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <YStack backgroundColor="$backgroundHover" padding="$5" borderRadius="$6" gap="$4">
            <XStack justifyContent="space-between" alignItems="baseline">
              <Text fontSize={14} color="$secondaryText" fontFamily="$body">
                Current Progress
              </Text>
              <Text fontSize={28} fontWeight="bold" color="$blue10" fontFamily="$heading">
                {progress.toFixed(0)}%
              </Text>
            </XStack>

            <Slider
              size="$4"
              width="100%"
              value={[current]}
              max={target > 0 ? target : 1}
              step={10}
              onValueChange={([val]) => setCurrent(val)}
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
                €{current.toLocaleString()}
              </Text>
              <Text fontSize={12} color="$secondaryText">
                €{target.toLocaleString()}
              </Text>
            </XStack>
          </YStack>
        </MotiView>

        {/* Form Fields */}
        <YStack gap="$4">
          {/* Goal Name */}
          <YStack gap="$2">
            <Label fontWeight="600" fontFamily="$body">
              Goal Name
            </Label>
            <Input
              size="$5"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Trip to Japan"
            />
          </YStack>

          {/* Target and Deadline Row */}
          <XStack gap="$4">
            <YStack flex={1} gap="$2">
              <Label fontWeight="600" fontFamily="$body">
                Target (€)
              </Label>
              <Input
                size="$5"
                keyboardType="numeric"
                value={target.toString()}
                onChangeText={(text) => setTarget(Number(text) || 0)}
              />
            </YStack>

            <YStack flex={1} gap="$2">
              <Label fontWeight="600" fontFamily="$body">
                Deadline
              </Label>
              <Button icon={Calendar} size="$5" backgroundColor="$backgroundHover" color="$color">
                {goal.endAt
                  ? goal.endAt.toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "Set Date"}
              </Button>
            </YStack>
          </XStack>
        </YStack>

        {/* Actions */}
        <YStack gap="$3" marginTop="$4">
          <Button
            themeInverse
            size="$5"
            fontWeight="bold"
            icon={Save}
            onPress={handleSave}
            disabled={isLoading}
            opacity={isLoading ? 0.6 : 1}
          >
            {updateGoal.isPending ? "Saving..." : "Save Changes"}
          </Button>

          <Theme name="red">
            <Button
              chromeless
              size="$4"
              color="$red10"
              icon={Trash2}
              onPress={handleDelete}
              disabled={isLoading}
            >
              Delete Goal
            </Button>
          </Theme>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
