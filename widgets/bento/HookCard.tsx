/**
 * HookCard - Attention-grabbing merchant insight
 *
 * Shows: "☕ Starbucks 12 times this month"
 */

import { MotiView } from "moti";
import React from "react";
import { Pressable } from "react-native";
import { Text, YStack } from "tamagui";

interface HookCardProps {
  /** Merchant name */
  merchantName: string;
  /** Number of visits/transactions */
  visitCount: number;
  /** Emoji for the merchant category */
  emoji?: string;
  /** Total amount spent (optional) */
  totalSpent?: number;
  /** Callback when card is pressed */
  onPress?: () => void;
}

// Format currency
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

// Get emoji based on merchant name (simple heuristic)
function getMerchantEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("coffee") || lower.includes("starbucks") || lower.includes("café"))
    return "☕";
  if (lower.includes("uber") || lower.includes("bolt") || lower.includes("taxi")) return "🚗";
  if (lower.includes("netflix") || lower.includes("spotify") || lower.includes("disney"))
    return "📺";
  if (lower.includes("amazon") || lower.includes("zara") || lower.includes("ikea")) return "🛍️";
  if (lower.includes("mcdonalds") || lower.includes("burger") || lower.includes("pizza"))
    return "🍔";
  if (lower.includes("grocery") || lower.includes("market") || lower.includes("continente"))
    return "🛒";
  if (lower.includes("gym") || lower.includes("fitness")) return "💪";
  if (lower.includes("pharmacy") || lower.includes("farmácia")) return "💊";
  return "💳";
}

export function HookCard({ merchantName, visitCount, emoji, totalSpent, onPress }: HookCardProps) {
  const displayEmoji = emoji || getMerchantEmoji(merchantName);

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <YStack padding="$3" alignItems="center" gap="$2">
        {/* Large emoji */}
        <MotiView
          from={{ scale: 0.5, rotate: "-10deg" }}
          animate={{ scale: 1, rotate: "0deg" }}
          transition={{ type: "spring", damping: 12 }}
        >
          <Text fontSize={48}>{displayEmoji}</Text>
        </MotiView>

        {/* Merchant name */}
        <Text color="$color" fontSize={16} fontWeight="bold" textAlign="center" numberOfLines={1}>
          {merchantName}
        </Text>

        {/* Visit count */}
        <Text color="$secondaryText" fontSize={12} textAlign="center">
          {visitCount} time{visitCount !== 1 ? "s" : ""} this month
        </Text>

        {/* Total spent (if provided) */}
        {totalSpent !== undefined && (
          <Text color="$accentColor" fontSize={14} fontWeight="600">
            {formatCurrency(totalSpent)}
          </Text>
        )}
      </YStack>
    </Pressable>
  );
}
