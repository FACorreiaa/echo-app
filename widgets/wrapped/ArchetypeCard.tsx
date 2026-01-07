/**
 * ArchetypeCard - Displays a behavioral archetype badge
 * Shows emoji, title, and description in a shareable card format
 */

import { MotiView } from "moti";
import React from "react";
import { Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";

export interface ArchetypeCardProps {
  /** Archetype ID (e.g., "coffee_enthusiast") */
  id: string;
  /** Display title (e.g., "Coffee Enthusiast") */
  title: string;
  /** Emoji for the archetype */
  emoji: string;
  /** Description text */
  description: string;
  /** Rank (1 = primary, 2 = secondary, etc.) */
  rank: number;
  /** Amount that triggered this archetype (in minor units) */
  amountMinor?: number;
  /** Compact mode */
  compact?: boolean;
}

// Rank-based colors
const getRankColor = (rank: number): string => {
  switch (rank) {
    case 1:
      return "#FFD700"; // Gold
    case 2:
      return "#C0C0C0"; // Silver
    case 3:
      return "#CD7F32"; // Bronze
    default:
      return "#6366F1"; // Indigo
  }
};

// Rank labels
const getRankLabel = (rank: number): string => {
  switch (rank) {
    case 1:
      return "🥇 Primary";
    case 2:
      return "🥈 Secondary";
    case 3:
      return "🥉 Tertiary";
    default:
      return "";
  }
};

export function ArchetypeCard({
  title,
  emoji,
  description,
  rank,
  compact = false,
}: ArchetypeCardProps) {
  const rankColor = getRankColor(rank);

  if (compact) {
    return (
      <MotiView
        from={{ opacity: 0, translateY: 10 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 400, delay: rank * 100 }}
      >
        <XStack
          backgroundColor="$backgroundHover"
          borderRadius="$3"
          padding="$2"
          alignItems="center"
          gap="$2"
          borderWidth={1}
          borderColor={rankColor as any}
        >
          <Text fontSize={20}>{emoji}</Text>
          <Text color="$color" fontSize={13} fontWeight="600" flex={1} numberOfLines={1}>
            {title}
          </Text>
        </XStack>
      </MotiView>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15, delay: rank * 100 }}
    >
      <GlassyCard>
        <YStack padding="$4" gap="$3">
          {/* Header with rank */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack
              backgroundColor={rankColor as any}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
            >
              <Text color="black" fontSize={10} fontWeight="bold">
                {getRankLabel(rank)}
              </Text>
            </XStack>
          </XStack>

          {/* Emoji + Title */}
          <XStack alignItems="center" gap="$3">
            <YStack
              backgroundColor="$backgroundHover"
              width={60}
              height={60}
              borderRadius={30}
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor={rankColor as any}
            >
              <Text fontSize={32}>{emoji}</Text>
            </YStack>
            <YStack flex={1}>
              <Text color="$color" fontSize={20} fontWeight="bold">
                {title}
              </Text>
              <Text color="$secondaryText" fontSize={13} numberOfLines={2}>
                {description}
              </Text>
            </YStack>
          </XStack>
        </YStack>
      </GlassyCard>
    </MotiView>
  );
}
