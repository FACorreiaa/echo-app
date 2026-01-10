import React from "react";
import { Pressable } from "react-native";
import { Progress, Separator, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { PlanItemWithConfig } from "@/lib/hooks/use-plan-items-by-tab";
import { formatMoney } from "@/lib/hooks/use-plan-items-by-tab";

// Define the Goal interface based on PlanItemWithConfig
interface GoalCardProps {
  goal: PlanItemWithConfig;
  onPress?: () => void;
}

const GOAL_EMOJIS: Record<string, string> = {
  save: "💰",
  invest: "📈",
  debt: "💳",
  custom: "🎯",
};

export function GoalCard({ goal, onPress }: GoalCardProps) {
  // Calculate progress
  // Avoid division by zero
  const budgeted = Number(goal.budgetedMinor);
  const actual = Number(goal.actualMinor);

  const progress = budgeted > 0 ? (actual / budgeted) * 100 : 0;

  const isCompleted = progress >= 100;
  const progressColor = isCompleted ? "$green10" : "$accentColor";

  // Emoji logic (if standard icons aren't available, or simple map)
  // Assuming name or some metadata maps to emoji, or just default to target
  const emoji = GOAL_EMOJIS["custom"];

  return (
    <Pressable onPress={onPress}>
      <GlassyCard>
        <YStack padding="$4" gap="$3">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$3">
              <XStack
                width={36}
                height={36}
                borderRadius="$4"
                backgroundColor="$backgroundHover"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize={18}>{emoji}</Text>
              </XStack>
              <YStack>
                <Text color="$color" fontSize={16} fontWeight="700">
                  {goal.name}
                </Text>
                <Text color="$secondaryText" fontSize={11}>
                  Target: {formatMoney(goal.budgetedMinor)}
                </Text>
              </YStack>
            </XStack>

            <XStack
              backgroundColor={isCompleted ? "$green2" : "$backgroundHover"}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$4"
            >
              <Text color={isCompleted ? "$green11" : "$color11"} fontSize={11} fontWeight="600">
                {progress.toFixed(0)}%
              </Text>
            </XStack>
          </XStack>

          <Separator borderColor="$borderColor" opacity={0.5} />

          {/* Progress Section */}
          <YStack gap="$2">
            <XStack justifyContent="space-between" alignItems="flex-end">
              <Text color="$secondaryText" fontSize={11} fontWeight="500">
                Progress
              </Text>
              <Text color="$color" fontWeight="700" fontSize={14}>
                {formatMoney(goal.actualMinor)}
              </Text>
            </XStack>

            <Progress value={Math.min(progress, 100)} size="$2" backgroundColor="$backgroundHover">
              <Progress.Indicator animation="bouncy" backgroundColor={progressColor as any} />
            </Progress>
          </YStack>
        </YStack>
      </GlassyCard>
    </Pressable>
  );
}
