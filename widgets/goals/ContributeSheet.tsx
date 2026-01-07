import { TrendingUp, X } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Alert, Pressable } from "react-native";
import { Button, Input, Label, ScrollView, Sheet, Text, TextArea, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import { useContributeToGoal, type Goal } from "@/lib/hooks/use-goals";

// ============================================================================
// Types
// ============================================================================

export interface ContributeSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onContributed?: () => void;
}

// ============================================================================
// Component
// ============================================================================

/**
 * ContributeSheet - Modal sheet for adding contributions to a goal
 *
 * Features:
 * - Enter contribution amount
 * - Optional note
 * - Shows goal progress and milestone info
 * - Success feedback with milestone celebration
 */
export function ContributeSheet({ open, onOpenChange, goal, onContributed }: ContributeSheetProps) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const contribute = useContributeToGoal();

  const resetForm = () => {
    setAmount("");
    setNote("");
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleContribute = async () => {
    if (!goal) {
      Alert.alert("Error", "No goal selected");
      return;
    }

    // Validation
    const contributionAmount = parseFloat(amount);
    if (isNaN(contributionAmount) || contributionAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const result = await contribute.mutateAsync({
        goalId: goal.id,
        amount: contributionAmount,
        note: note.trim() || undefined,
      });

      // Show success message with milestone celebration
      let successMessage = result.feedbackMessage;
      if (result.milestoneReached) {
        successMessage = `🎉 ${successMessage}\n\nYou've reached the ${result.milestonePercent}% milestone!`;
      }

      Alert.alert("Contribution Added!", successMessage);
      handleClose();
      onContributed?.();
    } catch (error) {
      Alert.alert("Error", "Failed to add contribution. Please try again.");
      console.error("Contribute error:", error);
    }
  };

  // Quick amount suggestions based on goal
  const getSuggestedAmounts = (): number[] => {
    if (!goal) return [];

    const remaining = goal.target - goal.current;
    const suggestions: number[] = [];

    // 10% of remaining
    suggestions.push(Math.round(remaining * 0.1));

    // 25% of remaining
    suggestions.push(Math.round(remaining * 0.25));

    // Daily amount needed (if there's a deadline)
    if (goal.amountNeededPerDay > 0) {
      suggestions.push(Math.round(goal.amountNeededPerDay));
    }

    // Half of remaining
    suggestions.push(Math.round(remaining * 0.5));

    return suggestions.filter((amt) => amt > 0).toSorted((a, b) => a - b);
  };

  const suggestedAmounts = getSuggestedAmounts();

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[75]} dismissOnSnapToBottom>
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
            Add Contribution
          </Text>
          <Pressable onPress={handleClose}>
            <X size={24} color="$secondaryText" />
          </Pressable>
        </XStack>

        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}>
          <YStack gap="$4" flex={1}>
            {/* Goal Info */}
            {goal && (
              <GlassyCard>
                <YStack gap="$2">
                  <Text color="$color" fontSize={18} fontWeight="600">
                    {goal.name}
                  </Text>
                  <XStack justifyContent="space-between" alignItems="baseline">
                    <Text color="$secondaryText" fontSize={14}>
                      Current progress:
                    </Text>
                    <Text color="$color" fontSize={16} fontWeight="600">
                      €{goal.current.toLocaleString()} / €{goal.target.toLocaleString()}
                    </Text>
                  </XStack>
                  <XStack justifyContent="space-between" alignItems="baseline">
                    <Text color="$secondaryText" fontSize={14}>
                      Remaining:
                    </Text>
                    <Text color="$accentColor" fontSize={16} fontWeight="600">
                      €{(goal.target - goal.current).toLocaleString()}
                    </Text>
                  </XStack>
                </YStack>
              </GlassyCard>
            )}

            {/* Contribution Amount */}
            <YStack gap="$2">
              <Label htmlFor="contribution-amount" color="$color" fontWeight="600">
                Contribution Amount (€) *
              </Label>
              <Input
                id="contribution-amount"
                placeholder="e.g., 500"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                color="$color"
              />
              {amount && parseFloat(amount) > 0 && (
                <Text color="$secondaryText" fontSize={12}>
                  €{parseFloat(amount).toLocaleString()}
                </Text>
              )}
            </YStack>

            {/* Quick Amount Suggestions */}
            {suggestedAmounts.length > 0 && (
              <YStack gap="$2">
                <Label color="$secondaryText" fontSize={12}>
                  Quick amounts:
                </Label>
                <XStack gap="$2" flexWrap="wrap">
                  {suggestedAmounts.map((amt) => (
                    <Pressable key={amt} onPress={() => setAmount(amt.toString())}>
                      <YStack
                        backgroundColor="$backgroundHover"
                        paddingHorizontal="$3"
                        paddingVertical="$2"
                        borderRadius="$3"
                        borderWidth={1}
                        borderColor={amount === amt.toString() ? "$accentColor" : "transparent"}
                      >
                        <Text color="$color" fontSize={14} fontWeight="500">
                          €{amt.toLocaleString()}
                        </Text>
                      </YStack>
                    </Pressable>
                  ))}
                </XStack>
              </YStack>
            )}

            {/* Note (Optional) */}
            <YStack gap="$2">
              <Label htmlFor="contribution-note" color="$color" fontWeight="600">
                Note (optional)
              </Label>
              <TextArea
                id="contribution-note"
                placeholder="e.g., Birthday gift money, Bonus from work"
                value={note}
                onChangeText={setNote}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                color="$color"
                numberOfLines={3}
              />
            </YStack>

            {/* Preview - New Progress */}
            {goal && amount && parseFloat(amount) > 0 && (
              <YStack backgroundColor="$backgroundHover" padding="$3" borderRadius="$3" gap="$2">
                <XStack alignItems="center" gap="$2">
                  <TrendingUp size={16} color="#22c55e" />
                  <Text color="$color" fontWeight="600" fontSize={14}>
                    After this contribution:
                  </Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text color="$secondaryText" fontSize={13}>
                    New progress:
                  </Text>
                  <Text color="$color" fontWeight="600" fontSize={13}>
                    €{(goal.current + parseFloat(amount)).toLocaleString()}
                  </Text>
                </XStack>
                <XStack justifyContent="space-between">
                  <Text color="$secondaryText" fontSize={13}>
                    Completion:
                  </Text>
                  <Text color="#22c55e" fontWeight="600" fontSize={13}>
                    {Math.min(
                      100,
                      Math.round(((goal.current + parseFloat(amount)) / goal.target) * 100),
                    )}
                    %
                  </Text>
                </XStack>
              </YStack>
            )}

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
                backgroundColor="#22c55e"
                color="white"
                onPress={handleContribute}
                disabled={contribute.isPending}
              >
                {contribute.isPending ? "Adding..." : "Add Contribution"}
              </Button>
            </XStack>
          </YStack>
        </ScrollView>
      </Sheet.Frame>
    </Sheet>
  );
}
