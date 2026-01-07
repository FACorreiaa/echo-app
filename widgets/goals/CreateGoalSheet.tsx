import { X } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Alert, Pressable } from "react-native";
import { Button, Input, Label, ScrollView, Sheet, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import { useCreateGoal } from "@/lib/hooks/use-goals";

// ============================================================================
// Types
// ============================================================================

export interface CreateGoalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated?: () => void;
}

type GoalTypeOption = {
  id: "save" | "pay_down_debt" | "spend_cap";
  label: string;
  description: string;
  emoji: string;
  color: string;
};

const GOAL_TYPES: GoalTypeOption[] = [
  {
    id: "save",
    label: "Savings Goal",
    description: "Build up funds for something specific",
    emoji: "💰",
    color: "#22c55e",
  },
  {
    id: "pay_down_debt",
    label: "Pay Down Debt",
    description: "Reduce loans or credit balances",
    emoji: "💳",
    color: "#ef4444",
  },
  {
    id: "spend_cap",
    label: "Spending Cap",
    description: "Set a limit on discretionary spending",
    emoji: "🎯",
    color: "#f59e0b",
  },
];

// ============================================================================
// Component
// ============================================================================

/**
 * CreateGoalSheet - Modal sheet for creating new financial goals
 *
 * Features:
 * - Select goal type (save, pay down debt, spend cap)
 * - Enter goal name and target amount
 * - Optional deadline date
 * - Form validation
 */
export function CreateGoalSheet({ open, onOpenChange, onGoalCreated }: CreateGoalSheetProps) {
  const [goalType, setGoalType] = useState<"save" | "pay_down_debt" | "spend_cap">("save");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [endDate, setEndDate] = useState("");

  const createGoal = useCreateGoal();

  const resetForm = () => {
    setGoalType("save");
    setName("");
    setTarget("");
    setEndDate("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreate = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a goal name");
      return;
    }

    const targetAmount = parseFloat(target);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert("Error", "Please enter a valid target amount");
      return;
    }

    // Parse end date if provided
    let endAt: Date | undefined;
    if (endDate.trim()) {
      endAt = new Date(endDate);
      if (isNaN(endAt.getTime())) {
        Alert.alert("Error", "Invalid date format. Use YYYY-MM-DD");
        return;
      }
      // Check if date is in the future
      if (endAt <= new Date()) {
        Alert.alert("Error", "End date must be in the future");
        return;
      }
    }

    try {
      await createGoal.mutateAsync({
        name: name.trim(),
        type: goalType,
        target: targetAmount,
        startAt: new Date(),
        endAt,
      });

      Alert.alert("Success", `Goal "${name.trim()}" created!`);
      handleClose();
      onGoalCreated?.();
    } catch (error) {
      Alert.alert("Error", "Failed to create goal. Please try again.");
      console.error("Create goal error:", error);
    }
  };

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[85]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Frame
        backgroundColor="$background"
        padding="$4"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        <Sheet.Handle />

        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$4" marginBottom="$6">
          <Text color="$color" fontSize={24} fontWeight="bold">
            Create Goal
          </Text>
          <Pressable onPress={handleClose}>
            <X size={24} color="$secondaryText" />
          </Pressable>
        </XStack>

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <YStack gap="$4" flex={1}>
            {/* Goal Type Selection */}
            <YStack gap="$2">
              <Label color="$color" fontWeight="600">
                Goal Type *
              </Label>
              <YStack gap="$2">
                {GOAL_TYPES.map((type) => (
                  <Pressable key={type.id} onPress={() => setGoalType(type.id)}>
                    <GlassyCard>
                      <XStack
                        padding="$3"
                        alignItems="center"
                        gap="$3"
                        opacity={goalType === type.id ? 1 : 0.6}
                      >
                        <YStack
                          width={24}
                          height={24}
                          borderRadius={12}
                          borderWidth={2}
                          borderColor={(goalType === type.id ? type.color : "$borderColor") as any}
                          backgroundColor={
                            (goalType === type.id ? type.color : "transparent") as any
                          }
                          alignItems="center"
                          justifyContent="center"
                        />
                        <Text fontSize={28}>{type.emoji}</Text>
                        <YStack flex={1}>
                          <Text color="$color" fontWeight="600" fontSize={16}>
                            {type.label}
                          </Text>
                          <Text color="$secondaryText" fontSize={13}>
                            {type.description}
                          </Text>
                        </YStack>
                      </XStack>
                    </GlassyCard>
                  </Pressable>
                ))}
              </YStack>
            </YStack>

            {/* Goal Name */}
            <YStack gap="$2">
              <Label htmlFor="goal-name" color="$color" fontWeight="600">
                Goal Name *
              </Label>
              <Input
                id="goal-name"
                placeholder="e.g., Emergency Fund, Vacation, Pay Off Credit Card"
                value={name}
                onChangeText={setName}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                color="$color"
              />
            </YStack>

            {/* Target Amount */}
            <YStack gap="$2">
              <Label htmlFor="target-amount" color="$color" fontWeight="600">
                Target Amount (€) *
              </Label>
              <Input
                id="target-amount"
                placeholder="e.g., 10000"
                value={target}
                onChangeText={setTarget}
                keyboardType="numeric"
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                color="$color"
              />
              {target && parseFloat(target) > 0 && (
                <Text color="$secondaryText" fontSize={12}>
                  €{parseFloat(target).toLocaleString()}
                </Text>
              )}
            </YStack>

            {/* End Date (Optional) */}
            <YStack gap="$2">
              <Label htmlFor="end-date" color="$color" fontWeight="600">
                Target Date (optional)
              </Label>
              <Input
                id="end-date"
                placeholder="YYYY-MM-DD (e.g., 2026-12-31)"
                value={endDate}
                onChangeText={setEndDate}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                color="$color"
              />
              <Text color="$secondaryText" fontSize={12}>
                Leave empty for open-ended goal
              </Text>
            </YStack>

            {/* Info Card */}
            <YStack backgroundColor="$backgroundHover" padding="$3" borderRadius="$3" gap="$1">
              <Text color="$color" fontWeight="600" fontSize={14}>
                💡 After creating your goal:
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • Track your progress with visual indicators
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • Add contributions manually or link transactions
              </Text>
              <Text color="$secondaryText" fontSize={13}>
                • Get pacing alerts if you fall behind
              </Text>
            </YStack>

            <YStack flex={1} />

            {/* Actions */}
            <XStack gap="$3" paddingTop="$4">
              <Button
                flex={1}
                backgroundColor="$backgroundHover"
                color="$color"
                onPress={handleClose}
              >
                Cancel
              </Button>
              <Button
                flex={2}
                backgroundColor="#2da6fa"
                color="white"
                onPress={handleCreate}
                disabled={createGoal.isPending}
              >
                {createGoal.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </XStack>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
