/**
 * WhatIfSlider - "What-if" savings calculator card
 *
 * Shows: "If you spend $X less/month → Save $Y/year"
 */

import { Minus, Plus } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React, { useState } from "react";
import { Button, Text, XStack, YStack } from "tamagui";

// Format currency
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

interface WhatIfSliderProps {
  /** Current monthly spend to base calculation on */
  currentMonthlySpend?: number;
  /** Max reduction to show */
  maxReduction?: number;
  /** Step increment */
  step?: number;
}

export function WhatIfSlider({ maxReduction = 300, step = 25 }: WhatIfSliderProps) {
  const [reduction, setReduction] = useState(50);

  const yearlySavings = reduction * 12;

  const increment = () => setReduction((v) => Math.min(v + step, maxReduction));
  const decrement = () => setReduction((v) => Math.max(v - step, 0));

  return (
    <YStack padding="$3" gap="$2">
      {/* Header */}
      <Text color="$secondaryText" fontSize={11} textTransform="uppercase">
        What If...
      </Text>

      {/* Savings display */}
      <YStack alignItems="center" gap="$1">
        <Text color="$color" fontSize={12}>
          Spend {formatCurrency(reduction)} less per month
        </Text>

        <MotiView
          key={yearlySavings}
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <Text color="#22c55e" fontSize={24} fontWeight="bold">
            +{formatCurrency(yearlySavings)}
          </Text>
        </MotiView>

        <Text color="$secondaryText" fontSize={11}>
          saved per year
        </Text>
      </YStack>

      {/* Increment/Decrement buttons */}
      <XStack justifyContent="center" alignItems="center" gap="$3">
        <Button
          circular
          size="$3"
          backgroundColor="$backgroundHover"
          onPress={decrement}
          disabled={reduction <= 0}
          opacity={reduction <= 0 ? 0.5 : 1}
        >
          <Minus size={18} color="$color" />
        </Button>

        <YStack
          backgroundColor="$backgroundHover"
          paddingHorizontal="$3"
          paddingVertical="$1"
          borderRadius="$2"
          minWidth={80}
          alignItems="center"
        >
          <Text color="$color" fontSize={16} fontWeight="600">
            {formatCurrency(reduction)}
          </Text>
        </YStack>

        <Button
          circular
          size="$3"
          backgroundColor="$backgroundHover"
          onPress={increment}
          disabled={reduction >= maxReduction}
          opacity={reduction >= maxReduction ? 0.5 : 1}
        >
          <Plus size={18} color="$color" />
        </Button>
      </XStack>
    </YStack>
  );
}
