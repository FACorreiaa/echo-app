import { GlassWidget } from "@/components/GlassWidget";
import { formatBalance } from "@/lib/hooks/use-balance";
import { useSystemHealth } from "@/lib/hooks/use-system-health";
import { Wallet } from "@tamagui/lucide-icons";
import React from "react";
import { H2, Paragraph, SizableText, XStack, YStack } from "tamagui";

export const DailyAllowanceWidget = () => {
  const { dailyAllowance } = useSystemHealth();

  // Calculate remaining days in month
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - now.getDate();

  // Determine status color based on allowance (simple heuristic)
  // > 50 good, < 20 bad
  let statusColor = "#22c55e"; // green
  if (dailyAllowance < 20)
    statusColor = "#ef4444"; // red
  else if (dailyAllowance < 50) statusColor = "#f97316"; // orange

  return (
    <GlassWidget marginBottom="$4" animation="bouncy">
      <YStack gap="$2">
        <XStack alignItems="center" gap="$2" marginBottom="$1">
          <Wallet size={14} color="$secondaryText" />
          <SizableText size="$2" color="$secondaryText" textTransform="uppercase" letterSpacing={1}>
            Daily Allowance
          </SizableText>
        </XStack>

        <H2 color={statusColor as any} fontWeight="800">
          {formatBalance(Math.max(0, dailyAllowance * 100))}
        </H2>

        <Paragraph size="$2" color="$secondaryText">
          Safe to spend today based on {daysRemaining} days remaining.
        </Paragraph>
      </YStack>
    </GlassWidget>
  );
};
