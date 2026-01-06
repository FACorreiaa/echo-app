/**
 * PacingMeter - Visual spending pace comparison component
 * Shows current spending pace vs last month with animated progress bar
 */

import { TrendingDown, TrendingUp } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";

interface PacingMeterProps {
  /** Current month spending */
  currentSpend: number;
  /** Same time last month spending */
  lastMonthSpend: number;
  /** Pace percentage (100 = same as last month) */
  pacePercent: number;
  /** Whether over pace */
  isOverPace: boolean;
  /** Day of month for context */
  dayOfMonth: number;
  /** Currency code */
  currencyCode?: string;
}

// Format currency for display
const formatCurrency = (amount: number, code = "EUR") =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

export function PacingMeter({
  currentSpend,
  lastMonthSpend,
  pacePercent,
  isOverPace,
  dayOfMonth,
  currencyCode = "EUR",
}: PacingMeterProps) {
  // Calculate progress bar width (cap at 150% for display)
  const barWidth = Math.min(pacePercent, 150);

  // Colors
  const overPaceColor = "#ef4444"; // Red
  const underPaceColor = "#22c55e"; // Green
  const barColor = isOverPace ? overPaceColor : underPaceColor;

  // Message based on pace
  const getMessage = () => {
    if (pacePercent < 80) return "Great job! Well under budget 💪";
    if (pacePercent < 100) return "On track to spend less this month";
    if (pacePercent <= 110) return "Slightly over pace";
    if (pacePercent <= 130) return "Spending faster than last month";
    return "Significantly over pace ⚠️";
  };

  return (
    <GlassyCard>
      <YStack padding="$4" gap="$3">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$color" fontSize={16} fontWeight="600">
            Spending Pace
          </Text>
          <Text color="$secondaryText" fontSize={12}>
            Day {dayOfMonth}
          </Text>
        </XStack>

        {/* Pace Bar Container */}
        <YStack gap="$2">
          {/* Labels */}
          <XStack justifyContent="space-between">
            <Text color="$secondaryText" fontSize={11}>
              {formatCurrency(currentSpend, currencyCode)}
            </Text>
            <Text color="$secondaryText" fontSize={11}>
              vs {formatCurrency(lastMonthSpend, currencyCode)} last month
            </Text>
          </XStack>

          {/* Progress Bar */}
          <YStack
            height={24}
            backgroundColor="$backgroundHover"
            borderRadius="$3"
            overflow="hidden"
          >
            {/* Animated fill */}
            <MotiView
              from={{ width: "0%" }}
              animate={{ width: `${Math.min(barWidth / 1.5, 100)}%` }}
              transition={{ type: "timing", duration: 800 }}
              style={[styles.progressBar, { backgroundColor: barColor }]}
            />

            {/* Baseline marker at 66% (representing 100% of last month) */}
            <YStack
              position="absolute"
              left="66%"
              top={0}
              bottom={0}
              width={2}
              backgroundColor="$color"
              opacity={0.3}
            />
          </YStack>

          {/* Pace percentage */}
          <XStack justifyContent="center" gap="$2" alignItems="center">
            {isOverPace ? (
              <TrendingUp size={16} color={overPaceColor} />
            ) : (
              <TrendingDown size={16} color={underPaceColor} />
            )}
            <Text color={barColor} fontSize={24} fontWeight="bold">
              {pacePercent.toFixed(0)}%
            </Text>
            <Text color="$secondaryText" fontSize={12}>
              of last month's pace
            </Text>
          </XStack>
        </YStack>

        {/* Message */}
        <XStack
          backgroundColor={isOverPace ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)"}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
          justifyContent="center"
        >
          <Text color={barColor} fontSize={13} textAlign="center">
            {getMessage()}
          </Text>
        </XStack>
      </YStack>
    </GlassyCard>
  );
}

const styles = StyleSheet.create({
  progressBar: {
    height: "100%",
    borderRadius: 8,
  },
});
