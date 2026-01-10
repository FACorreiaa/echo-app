import { CalendarClock, CheckCircle } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import { Progress, Separator, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { PlanItemWithConfig } from "@/lib/hooks/use-plan-items-by-tab";
import { formatMoney } from "@/lib/hooks/use-plan-items-by-tab";

interface RecurringCardProps {
  item: PlanItemWithConfig;
  onPress?: () => void;
}

export function RecurringCard({ item, onPress }: RecurringCardProps) {
  const actual = Number(item.actualMinor);
  const budgeted = Number(item.budgetedMinor);

  // For recurring, if actual >= budgeted, it's "Paid"
  const isPaid = actual >= budgeted && budgeted > 0;
  const progress = budgeted > 0 ? (actual / budgeted) * 100 : 0;

  return (
    <Pressable onPress={onPress}>
      <GlassyCard>
        <YStack padding="$4" gap="$3">
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
                <CalendarClock size={18} color="$accentColor" />
              </XStack>
              <YStack>
                <Text color="$color" fontSize={16} fontWeight="700">
                  {item.name}
                </Text>
                <Text color="$secondaryText" fontSize={11}>
                  Due: {formatMoney(item.budgetedMinor)}
                </Text>
              </YStack>
            </XStack>

            {isPaid ? (
              <XStack
                backgroundColor="$green2"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$4"
                gap="$1"
                alignItems="center"
              >
                <CheckCircle size={10} color="$green10" />
                <Text color="$green11" fontSize={10} fontWeight="700">
                  PAID
                </Text>
              </XStack>
            ) : (
              <Text color="$secondaryText" fontSize={11} fontWeight="500">
                Unpaid
              </Text>
            )}
          </XStack>

          {/* If partial payments are possible, show progress, otherwise just amount */}
          <Separator borderColor="$borderColor" opacity={0.5} />

          <XStack justifyContent="space-between" alignItems="center">
            <Text color="$secondaryText" fontSize={12}>
              Status
            </Text>
            <Text color={isPaid ? "$green10" : "$color"} fontWeight="600" fontSize={14}>
              {formatMoney(item.actualMinor)}{" "}
              <Text color="$secondaryText" fontSize={12}>
                / {formatMoney(item.budgetedMinor)}
              </Text>
            </Text>
          </XStack>

          {/* Optional small progress bar if partially paid */}
          {!isPaid && actual > 0 && (
            <Progress value={Math.min(progress, 100)} size="$2" backgroundColor="$backgroundHover">
              <Progress.Indicator animation="bouncy" backgroundColor="$accentColor" />
            </Progress>
          )}
        </YStack>
      </GlassyCard>
    </Pressable>
  );
}
