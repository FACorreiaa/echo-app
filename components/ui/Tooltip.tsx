/**
 * Tooltip - Cross-platform tooltip component
 *
 * Works with:
 * - Web: hover to show tooltip
 * - Mobile: long-press to show tooltip
 */

import { Info } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Pressable } from "react-native";
import { Popover, Text, YStack } from "tamagui";

interface TooltipProps {
  /** The tooltip content to display */
  content: string;
  /** The element that triggers the tooltip */
  children: React.ReactNode;
  /** Position of the tooltip relative to the trigger */
  position?: "top" | "bottom" | "left" | "right";
  /** Optional max width for the tooltip */
  maxWidth?: number;
  /** Show an info icon instead of wrapping children */
  asIcon?: boolean;
}

export function Tooltip({
  content,
  children,
  position = "top",
  maxWidth = 200,
  asIcon = false,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  // Map position to Popover placement
  const placementMap = {
    top: "top" as const,
    bottom: "bottom" as const,
    left: "left" as const,
    right: "right" as const,
  };

  const trigger = asIcon ? <Info size={14} color="$secondaryText" /> : children;

  return (
    <Popover open={visible} onOpenChange={setVisible} placement={placementMap[position]}>
      <Popover.Trigger asChild>
        <Pressable
          onHoverIn={() => setVisible(true)}
          onHoverOut={() => setVisible(false)}
          onLongPress={() => setVisible(true)}
          onPressOut={() => setVisible(false)}
          delayLongPress={300}
        >
          {trigger}
        </Pressable>
      </Popover.Trigger>

      <Popover.Content
        backgroundColor="$glassBackground"
        borderColor="$glassBorder"
        borderWidth={1}
        borderRadius="$3"
        padding="$2"
        paddingHorizontal="$3"
        maxWidth={maxWidth}
        shadowColor="$shadowColor"
        shadowRadius={8}
        shadowOpacity={0.15}
        enterStyle={{ opacity: 0, scale: 0.95 }}
        exitStyle={{ opacity: 0, scale: 0.95 }}
        animation="quick"
      >
        <Popover.Arrow backgroundColor="$glassBackground" borderColor="$glassBorder" />
        <YStack>
          <Text color="$color" fontSize={12} lineHeight={16}>
            {content}
          </Text>
        </YStack>
      </Popover.Content>
    </Popover>
  );
}

// Pre-defined tooltips for item types
export const ITEM_TYPE_TOOLTIPS: Record<string, string> = {
  budget:
    "Monthly spending limits that reset each period. Track variable expenses like groceries or entertainment.",
  recurring: "Fixed expenses like rent or subscriptions that don't vary month to month.",
  goal: "Savings targets you're working toward over time, like an emergency fund or vacation.",
  income: "Expected income sources that fund your budget. Salary, freelance, investments, etc.",
  investment: "Assets that grow over time like stocks, crypto, or retirement accounts.",
  debt: "Liabilities you're paying down like loans, mortgages, or credit cards.",
};

// Short code mapping
export const ITEM_TYPE_SHORT_CODES: Record<string, string> = {
  budget: "B",
  recurring: "R",
  goal: "S",
  income: "IN",
  investment: "I",
  debt: "D",
};
