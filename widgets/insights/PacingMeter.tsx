/**
 * PacingMeter - Visual spending pace comparison component
 * Enhanced with Ghost Time Indicator to show spending vs time.
 */

import { GlassWidget } from "@/components/GlassWidget";
import { TrendingDown, TrendingUp } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React from "react";
import { SizableText, Text, XStack, YStack, useTheme } from "tamagui";

interface PacingMeterProps {
  /** Current month spending */
  currentSpend: number;
  /** Total monthly budget */
  monthlyBudget: number;
  /** Days elapsed in the month */
  daysElapsed: number;
  /** Total days in the month */
  daysTotal: number;
  /** Currency code */
  currencyCode?: string;
}

export function PacingMeter({
  currentSpend,
  monthlyBudget,
  daysElapsed,
  daysTotal,
  currencyCode = "EUR",
}: PacingMeterProps) {
  const theme = useTheme();

  // 1. Calculate Progress
  const spendingProgress = Math.min((currentSpend / monthlyBudget) * 100, 100);
  const timeProgress = (daysElapsed / daysTotal) * 100;

  // 2. Determine Pace
  // If spending progress > time progress => Overpacing
  const isOverPacing = spendingProgress > timeProgress;
  const burnRate = timeProgress > 0 ? spendingProgress / timeProgress : 0;

  // Colors
  const overPaceColor = "$red10";
  const underPaceColor = "$green10";
  const barColor = isOverPacing ? overPaceColor : underPaceColor;

  // Message
  const getMessage = () => {
    if (burnRate > 1.5) return "Spending 1.5x faster than time! ⚠️";
    if (burnRate > 1.1) return "Slightly ahead of schedule";
    if (burnRate < 0.8) return "Great! Well under budget 💪";
    return "On track";
  };

  return (
    <GlassWidget marginBottom="$4">
      <YStack gap="$2.5">
        <XStack alignItems="center" gap="$2" opacity={0.8}>
          <TrendingUp size={14} color={"$gray11" as any} />
          <SizableText
            size="$2"
            color={"$gray11" as any}
            textTransform="uppercase"
            letterSpacing={1}
          >
            Monthly Pacing
          </SizableText>
        </XStack>
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$secondaryText" fontSize={12}>
            Day {daysElapsed} / {daysTotal}
          </Text>
        </XStack>

        {/* Stats */}
        <XStack justifyContent="space-between">
          <YStack>
            <Text color="$secondaryText" fontSize={11}>
              Spent
            </Text>
            <Text color="$color" fontSize={14}>
              {formatBalance(currentSpend, currencyCode)}
            </Text>
          </YStack>
          <YStack items="flex-end">
            <Text color="$secondaryText" fontSize={11}>
              Budget
            </Text>
            <Text color="$color" fontSize={14}>
              {formatBalance(monthlyBudget, currencyCode)}
            </Text>
          </YStack>
        </XStack>

        {/* Progress Bar Container */}
        <YStack height={32} justifyContent="center">
          {/* Track */}
          <YStack
            height={12}
            backgroundColor="$backgroundHover"
            borderRadius="$3"
            overflow="hidden"
            width="100%"
          >
            {/* Spending Bar */}
            <MotiView
              from={{ width: "0%" }}
              animate={{ width: `${spendingProgress}%` }}
              transition={{ type: "timing", duration: 800 }}
              style={{
                height: "100%",
                backgroundColor: (theme[barColor as any] as any)?.val || "#22c55e",
                borderRadius: 6,
              }}
            />
          </YStack>

          {/* Ghost Time Indicator Line */}
          <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 0.8 }}
            transition={{ loop: true, type: "timing", duration: 1500 }}
            style={{
              position: "absolute",
              left: `${timeProgress}%`,
              top: -4,
              bottom: -4,
              width: 2,
              backgroundColor: (theme.color as any)?.val || "white",
              zIndex: 10,
            }}
          />

          {/* Ghost Label */}
          <Text
            position="absolute"
            left={`${Math.min(timeProgress, 90)}%` as any} // Prevent overflow
            top={-20}
            fontSize={10}
            color="$secondaryText"
            style={{ transform: [{ translateX: -10 }] }} // Center approx
          >
            Today
          </Text>
        </YStack>

        {/* Footer Status */}
        <XStack
          backgroundColor={isOverPacing ? "$red2" : "$green2"}
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
          justifyContent="center"
          alignItems="center"
          gap="$2"
        >
          {isOverPacing ? (
            <TrendingUp size={14} color={overPaceColor as any} />
          ) : (
            <TrendingDown size={14} color={underPaceColor as any} />
          )}
          <Text color={barColor as any} fontSize={13} textAlign="center">
            {getMessage()}
          </Text>
        </XStack>
      </YStack>
    </GlassWidget>
  );
}
