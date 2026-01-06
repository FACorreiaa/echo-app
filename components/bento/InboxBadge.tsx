/**
 * InboxBadge - Transaction review prompt card
 *
 * Shows: "4 transactions need review"
 */

import { Inbox } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React from "react";
import { Pressable } from "react-native";
import { Text, XStack, YStack } from "tamagui";

interface InboxBadgeProps {
  /** Number of items needing review */
  count: number;
  /** Callback when pressed */
  onPress?: () => void;
}

export function InboxBadge({ count, onPress }: InboxBadgeProps) {
  const hasItems = count > 0;

  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <YStack padding="$3" alignItems="center" gap="$2" flex={1} justifyContent="center">
        {/* Icon with badge */}
        <XStack position="relative">
          <MotiView
            animate={{
              rotate: hasItems ? ["0deg", "5deg", "-5deg", "0deg"] : "0deg",
            }}
            transition={{
              type: "timing",
              duration: 500,
              loop: hasItems,
              delay: 2000,
            }}
          >
            <Inbox size={36} color={hasItems ? "$accentColor" : "$secondaryText"} />
          </MotiView>

          {/* Badge */}
          {hasItems && (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10 }}
              style={{
                position: "absolute",
                top: -6,
                right: -8,
                backgroundColor: "#ef4444",
                borderRadius: 10,
                minWidth: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text color="white" fontSize={11} fontWeight="bold">
                {count > 99 ? "99+" : count}
              </Text>
            </MotiView>
          )}
        </XStack>

        {/* Text */}
        <Text color="$color" fontSize={14} fontWeight="600" textAlign="center">
          {hasItems ? "Review Inbox" : "All caught up!"}
        </Text>

        <Text color="$secondaryText" fontSize={12} textAlign="center">
          {hasItems
            ? `${count} transaction${count !== 1 ? "s" : ""} need${count === 1 ? "s" : ""} review`
            : "No pending items"}
        </Text>
      </YStack>
    </Pressable>
  );
}
