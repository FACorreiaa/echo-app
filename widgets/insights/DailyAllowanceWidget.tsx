import { GlassyCard } from "@/components/ui/GlassyCard";
import { formatBalance } from "@/lib/hooks/use-balance";
import { useSystemHealth } from "@/lib/hooks/use-system-health";
import { Wallet } from "@tamagui/lucide-icons";
import React from "react";
import { H2, Paragraph, SizableText, XStack, YStack } from "tamagui";

export const DailyAllowanceWidget = () => {
  const { dailyAllowance, isLoading } = useSystemHealth();

  if (isLoading) return null;

  // Determine color based on allowance amount
  let statusColor = "$green10";
  if (dailyAllowance < 15) {
    statusColor = "$red10";
  } else if (dailyAllowance < 30) {
    statusColor = "$orange10";
  }

  // Calculate days remaining in current month
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = lastDay.getDate() - now.getDate();

  return (
    <GlassyCard p="$4" mb="$4" animation="bouncy">
      <YStack space="$2">
        <XStack ai="center" space="$2" opacity={0.8} mb="$1">
          <Wallet size={14} color="$gray11" />
          <SizableText size="$2" color="$gray11" tt="uppercase" ls={1}>
            Daily Allowance
          </SizableText>
        </XStack>

        <H2 color={statusColor as any} fow="800">
          {formatBalance(Math.max(0, dailyAllowance * 100))}
        </H2>

        <Paragraph size="$2" color="$gray10">
          Safe to spend today based on {daysRemaining} days remaining.
        </Paragraph>
      </YStack>
    </GlassyCard>
  );
};
