import { Text, YStack } from "tamagui";

import type { Subscription } from "@/lib/hooks/use-subscriptions";

import { SubscriptionCard } from "./SubscriptionCard";

// ============================================================================
// Component
// ============================================================================

export interface SubscriptionListProps {
  subscriptions: Subscription[];
  onSubscriptionPress?: (subscription: Subscription) => void;
  onSubscriptionLongPress?: (subscription: Subscription) => void;
  showConfidence?: boolean;
  emptyMessage?: string;
}

/**
 * SubscriptionList - Displays a list of subscriptions
 *
 * Features:
 * - Renders subscription cards in a vertical list
 * - Empty state with custom message
 * - Pass-through press handlers
 * - Optional confidence indicators
 */
export function SubscriptionList({
  subscriptions,
  onSubscriptionPress,
  onSubscriptionLongPress,
  showConfidence = false,
  emptyMessage = "No subscriptions found",
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <YStack padding="$6" alignItems="center" justifyContent="center">
        <Text color="$secondaryText" fontSize={14} textAlign="center">
          {emptyMessage}
        </Text>
      </YStack>
    );
  }

  return (
    <YStack gap={12}>
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          onPress={() => onSubscriptionPress?.(subscription)}
          onLongPress={() => onSubscriptionLongPress?.(subscription)}
          showConfidence={showConfidence}
        />
      ))}
    </YStack>
  );
}
