/**
 * EditRecurringSheet - Interactive bottom sheet for managing recurring subscriptions
 *
 * Features:
 * - View subscription details (amount, cadence, total spent)
 * - Pause/Resume subscription tracking
 * - Mark as canceled
 * - Next billing date display
 */

import { Calendar, Pause, Play, Trash2 } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React from "react";
import { Alert } from "react-native";
import { Button, Sheet, Text, Theme, XStack, YStack } from "tamagui";

import type { Subscription } from "@/lib/hooks/use-subscriptions";
import { useUpdateSubscriptionStatus } from "@/lib/hooks/use-subscriptions";

// ============================================================================
// Types
// ============================================================================

export interface EditRecurringSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription: Subscription | null;
  onSubscriptionUpdated?: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

function formatCadence(cadence: Subscription["cadence"]): string {
  const map = {
    monthly: "Monthly",
    weekly: "Weekly",
    yearly: "Yearly",
    quarterly: "Quarterly",
  };
  return map[cadence] || cadence;
}

function getStatusColor(status: Subscription["status"]): string {
  const map = {
    active: "#22c55e",
    paused: "#f59e0b",
    canceled: "#ef4444",
  };
  return map[status] || "#6b7280";
}

// ============================================================================
// Component
// ============================================================================

export function EditRecurringSheet({
  open,
  onOpenChange,
  subscription,
  onSubscriptionUpdated,
}: EditRecurringSheetProps) {
  // Mutations
  const updateStatus = useUpdateSubscriptionStatus();

  // Computed
  const isLoading = updateStatus.isPending;

  const handlePauseResume = async () => {
    if (!subscription) return;

    const newStatus = subscription.status === "active" ? "paused" : "active";
    try {
      await updateStatus.mutateAsync({
        subscriptionId: subscription.id,
        status: newStatus,
      });
      onSubscriptionUpdated?.();
      onOpenChange(false);
    } catch {
      Alert.alert("Error", "Failed to update subscription. Please try again.");
    }
  };

  const handleCancel = () => {
    if (!subscription) return;

    Alert.alert(
      "Cancel Subscription",
      `Mark "${subscription.merchantName}" as canceled? You can track this again later if needed.`,
      [
        { text: "Keep Active", style: "cancel" },
        {
          text: "Mark Canceled",
          style: "destructive",
          onPress: async () => {
            try {
              await updateStatus.mutateAsync({
                subscriptionId: subscription.id,
                status: "canceled",
                note: "Canceled via app",
              });
              onSubscriptionUpdated?.();
              onOpenChange(false);
            } catch {
              Alert.alert("Error", "Failed to cancel. Please try again.");
            }
          },
        },
      ],
    );
  };

  if (!subscription) return null;

  const statusColor = getStatusColor(subscription.status);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[70]}
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
            {subscription.merchantName}
          </Text>
          <XStack
            backgroundColor={`${statusColor}20` as any}
            paddingHorizontal="$3"
            paddingVertical="$1"
            borderRadius="$4"
          >
            <Text color={statusColor as any} fontSize={14} fontWeight="600">
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </Text>
          </XStack>
        </YStack>

        {/* Details Card */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 300 }}
        >
          <YStack backgroundColor="$backgroundHover" padding="$5" borderRadius="$6" gap="$4">
            {/* Amount & Cadence */}
            <XStack justifyContent="space-between">
              <YStack>
                <Text fontSize={12} color="$secondaryText">
                  Amount
                </Text>
                <Text fontSize={28} fontWeight="bold" fontFamily="$heading">
                  €{subscription.amount.toLocaleString()}
                </Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text fontSize={12} color="$secondaryText">
                  Frequency
                </Text>
                <Text fontSize={18} fontWeight="600" fontFamily="$heading">
                  {formatCadence(subscription.cadence)}
                </Text>
              </YStack>
            </XStack>

            {/* Stats Row */}
            <XStack justifyContent="space-between" paddingTop="$2">
              <YStack>
                <Text fontSize={12} color="$secondaryText">
                  Total Spent
                </Text>
                <Text fontSize={16} fontWeight="600">
                  €{subscription.totalSpent.toLocaleString()}
                </Text>
              </YStack>
              <YStack alignItems="flex-end">
                <Text fontSize={12} color="$secondaryText">
                  Occurrences
                </Text>
                <Text fontSize={16} fontWeight="600">
                  {subscription.occurrenceCount}x
                </Text>
              </YStack>
            </XStack>

            {/* Next Billing */}
            {subscription.nextExpectedAt && (
              <XStack
                backgroundColor="rgba(45, 166, 250, 0.1)"
                padding="$3"
                borderRadius="$4"
                gap="$2"
                alignItems="center"
              >
                <Calendar size={16} color="#2da6fa" />
                <Text color="$blue10" fontSize={14}>
                  Next billing:{" "}
                  {subscription.nextExpectedAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </XStack>
            )}
          </YStack>
        </MotiView>

        {/* Actions */}
        <YStack gap="$3" marginTop="$2">
          {/* Pause/Resume Button */}
          {subscription.status !== "canceled" && (
            <Button
              size="$5"
              fontWeight="bold"
              icon={subscription.status === "active" ? Pause : Play}
              onPress={handlePauseResume}
              disabled={isLoading}
              backgroundColor={
                subscription.status === "active" ? ("$orange4" as any) : ("$green4" as any)
              }
            >
              {subscription.status === "active" ? "Pause Tracking" : "Resume Tracking"}
            </Button>
          )}

          {/* Cancel Button */}
          {subscription.status !== "canceled" && (
            <Theme name="red">
              <Button
                chromeless
                size="$4"
                color="$red10"
                icon={Trash2}
                onPress={handleCancel}
                disabled={isLoading}
              >
                Mark as Canceled
              </Button>
            </Theme>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
