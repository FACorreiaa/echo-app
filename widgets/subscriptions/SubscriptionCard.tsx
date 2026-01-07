import { Calendar, CheckCircle, Pause, XCircle } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { styled, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { Subscription } from "@/lib/hooks/use-subscriptions";

// ============================================================================
// Styled Components
// ============================================================================

const SubscriptionName = styled(Text, {
  color: "$color",
  fontSize: 16,
  fontFamily: "$heading",
  fontWeight: "600",
});

const SubscriptionDetails = styled(Text, {
  color: "$secondaryText",
  fontSize: 13,
  fontFamily: "$body",
});

const AmountLabel = styled(Text, {
  color: "$color",
  fontSize: 20,
  fontFamily: "$heading",
  fontWeight: "bold",
});

const StatusBadge = styled(XStack, {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  alignItems: "center",
  gap: 4,
  variants: {
    status: {
      active: { backgroundColor: "rgba(34, 197, 94, 0.2)" },
      paused: { backgroundColor: "rgba(245, 158, 11, 0.2)" },
      canceled: { backgroundColor: "rgba(107, 114, 128, 0.2)" },
    },
  } as const,
});

const statusColors = {
  active: "#22c55e",
  paused: "#f59e0b",
  canceled: "#6b7280",
};

const statusLabels = {
  active: "Active",
  paused: "Paused",
  canceled: "Canceled",
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatCadence(cadence: string): string {
  switch (cadence) {
    case "monthly":
      return "/month";
    case "weekly":
      return "/week";
    case "yearly":
      return "/year";
    case "quarterly":
      return "/quarter";
    default:
      return "";
  }
}

function formatNextCharge(date: Date | null): string {
  if (!date) return "Unknown";

  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `In ${diffDays} days`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return CheckCircle;
    case "paused":
      return Pause;
    case "canceled":
      return XCircle;
    default:
      return CheckCircle;
  }
}

// ============================================================================
// Component
// ============================================================================

export interface SubscriptionCardProps {
  subscription: Subscription;
  onPress?: () => void;
  onLongPress?: () => void;
  showConfidence?: boolean;
}

/**
 * SubscriptionCard - Displays a single recurring subscription
 *
 * Features:
 * - Shows merchant name, amount, and cadence
 * - Status badge with icon
 * - Next charge date
 * - Confidence indicator (for newly detected subscriptions)
 * - Tappable for detail view
 */
export function SubscriptionCard({
  subscription,
  onPress,
  onLongPress,
  showConfidence: _showConfidence = false,
}: SubscriptionCardProps) {
  const StatusIcon = getStatusIcon(subscription.status);

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress}>
      <GlassyCard>
        <YStack gap={12}>
          {/* Header: Name + Status */}
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack gap={4} flex={1}>
              <SubscriptionName>{subscription.merchantName}</SubscriptionName>
              <XStack alignItems="center" gap={6}>
                <Calendar size={14} color="$secondaryText" />
                <SubscriptionDetails>
                  Next: {formatNextCharge(subscription.nextExpectedAt)}
                </SubscriptionDetails>
              </XStack>
            </YStack>

            <StatusBadge status={subscription.status}>
              <StatusIcon size={14} color={statusColors[subscription.status] as any} />
              <Text
                color={statusColors[subscription.status] as any}
                fontSize={11}
                fontFamily="$body"
                fontWeight="600"
              >
                {statusLabels[subscription.status]}
              </Text>
            </StatusBadge>
          </XStack>

          {/* Amount + Cadence */}
          <XStack justifyContent="space-between" alignItems="baseline">
            <AmountLabel>€{subscription.amount.toFixed(2)}</AmountLabel>
            <SubscriptionDetails>{formatCadence(subscription.cadence)}</SubscriptionDetails>
          </XStack>

          {/* Footer: Stats */}
          <XStack justifyContent="space-between" alignItems="center">
            <SubscriptionDetails>
              {subscription.occurrenceCount} charges • €{subscription.totalSpent.toFixed(2)} total
            </SubscriptionDetails>
          </XStack>
        </YStack>
      </GlassyCard>
    </Pressable>
  );
}
