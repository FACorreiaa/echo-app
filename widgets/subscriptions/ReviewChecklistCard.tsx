import { AlertTriangle, Check } from "@tamagui/lucide-icons";
import { Button, styled, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { ReviewChecklistItem } from "@/lib/hooks/use-subscriptions";

// ============================================================================
// Styled Components
// ============================================================================

const ItemTitle = styled(Text, {
  color: "$color",
  fontSize: 16,
  fontFamily: "$heading",
  fontWeight: "600",
});

const ItemDetails = styled(Text, {
  color: "$secondaryText",
  fontSize: 13,
  fontFamily: "$body",
});

const RecommendationText = styled(Text, {
  color: "$color",
  fontSize: 14,
  fontFamily: "$body",
  lineHeight: 20,
});

// ============================================================================
// Component
// ============================================================================

export interface ReviewChecklistCardProps {
  item: ReviewChecklistItem;
  onMarkReviewed: (subscriptionId: string) => void;
  onCancel: (subscriptionId: string) => void;
  isProcessing?: boolean;
}

/**
 * ReviewChecklistCard - Displays a subscription that needs review
 *
 * Features:
 * - Shows merchant, amount, and stats
 * - AI-powered recommendation
 * - Quick action buttons (Mark as Reviewed, Cancel)
 */
export function ReviewChecklistCard({
  item,
  onMarkReviewed,
  onCancel,
  isProcessing = false,
}: ReviewChecklistCardProps) {
  const sub = item.subscription;

  return (
    <GlassyCard>
      <YStack gap={16}>
        {/* Header: Merchant + Alert */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack gap={4} flex={1}>
            <XStack alignItems="center" gap={8}>
              <ItemTitle>{sub.merchantName}</ItemTitle>
              {item.recommendedCancel && (
                <YStack
                  backgroundColor="rgba(239, 68, 68, 0.2)"
                  paddingHorizontal={8}
                  paddingVertical={2}
                  borderRadius={8}
                >
                  <Text color="#ef4444" fontSize={10} fontWeight="600">
                    REVIEW NEEDED
                  </Text>
                </YStack>
              )}
            </XStack>
            <ItemDetails>
              €{sub.amount.toFixed(2)} • {sub.cadence}
            </ItemDetails>
          </YStack>
        </XStack>

        {/* Stats */}
        <XStack gap={16} flexWrap="wrap">
          <YStack>
            <ItemDetails>Total Spent</ItemDetails>
            <Text color="$color" fontSize={16} fontWeight="600">
              €{sub.totalSpent.toFixed(2)}
            </Text>
          </YStack>

          <YStack>
            <ItemDetails>Charges</ItemDetails>
            <Text color="$color" fontSize={16} fontWeight="600">
              {sub.occurrenceCount}
            </Text>
          </YStack>

          {sub.lastSeenAt && (
            <YStack>
              <ItemDetails>Last Charged</ItemDetails>
              <Text color="$color" fontSize={14} fontWeight="600">
                {sub.lastSeenAt.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </YStack>
          )}
        </XStack>

        {/* Recommendation */}
        <YStack
          backgroundColor={item.recommendedCancel ? "rgba(239, 68, 68, 0.1)" : "$backgroundHover"}
          padding={12}
          borderRadius={8}
          gap={6}
        >
          <XStack alignItems="center" gap={6}>
            <AlertTriangle size={16} color={item.recommendedCancel ? "#ef4444" : "#f59e0b"} />
            <Text
              color={item.recommendedCancel ? "#ef4444" : "#f59e0b"}
              fontSize={12}
              fontWeight="600"
              textTransform="uppercase"
            >
              {item.recommendedCancel ? "Action Required" : "Review Suggested"}
            </Text>
          </XStack>
          <RecommendationText>{item.reasonMessage}</RecommendationText>
        </YStack>

        {/* Actions */}
        <XStack gap={8}>
          <Button
            flex={1}
            backgroundColor="$backgroundHover"
            color="$color"
            onPress={() => onMarkReviewed(sub.id)}
            disabled={isProcessing}
            pressStyle={{ opacity: 0.8 }}
          >
            <XStack alignItems="center" gap={6}>
              <Check size={16} color="$color" />
              <Text color="$color" fontSize={14} fontWeight="600">
                Keep It
              </Text>
            </XStack>
          </Button>

          <Button
            flex={1}
            backgroundColor="rgba(239, 68, 68, 0.2)"
            onPress={() => onCancel(sub.id)}
            disabled={isProcessing}
            pressStyle={{ opacity: 0.8 }}
          >
            <Text color="#ef4444" fontSize={14} fontWeight="600">
              Cancel
            </Text>
          </Button>
        </XStack>
      </YStack>
    </GlassyCard>
  );
}
