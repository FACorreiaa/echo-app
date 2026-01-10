import { GlassWidget } from "@/components/GlassWidget";
import { formatBalance } from "@/lib/hooks/use-balance";
import { useSystemHealth } from "@/lib/hooks/use-system-health";
import { Wallet } from "@tamagui/lucide-icons";
import React from "react";
import { H2, Paragraph, SizableText, XStack, YStack } from "tamagui";

export const DailyAllowanceWidget = () => {
  const { dailyAllowance, _ } = useSystemHealth();

  // Calculate remaining days in month
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - now.getDate();

  // Determine status color based on allowance (simple heuristic)
  // > 50 good, < 20 bad
  let statusColor = "$green10";
  if (dailyAllowance < 20) statusColor = "$red10";
  else if (dailyAllowance < 50) statusColor = "$orange10";

  return (
    <GlassWidget marginBottom="$4" animation="bouncy">
      <YStack gap="$2">
        <XStack alignItems="center" gap="$2" opacity={0.8} marginBottom="$1">
          <Wallet size={14} color={"$gray11" as any} />
          <SizableText
            size="$2"
            color={"$gray11" as any}
            textTransform="uppercase"
            letterSpacing={1}
          >
            Daily Allowance
          </SizableText>
        </XStack>

        <H2 color={statusColor as any} fontWeight="800">
          {formatBalance(Math.max(0, dailyAllowance * 100))}
        </H2>

        <Paragraph size="$2" color={"$gray10" as any}>
          Safe to spend today based on {daysRemaining} days remaining.
        </Paragraph>
      </YStack>
    </GlassWidget>
  );
};
