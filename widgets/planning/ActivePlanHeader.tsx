import { Activity, AlertTriangle, CheckCircle, Target, TrendingUp } from "@tamagui/lucide-icons";
import React from "react";
import { H4, Paragraph, Progress, Separator, Text, XStack, YStack } from "tamagui";

import { GlassWidget } from "@/components/GlassWidget";
import { formatBalance } from "@/lib/hooks/use-balance";
import { useSystemHealth } from "@/lib/hooks/use-system-health";

/**
 * ActivePlanHeader - "The Pulse" of the FinanceOS
 *
 * Displays the real-time health of the user's financial system:
 * 1. Health Score: Composite 0-100 score.
 * 2. Pacing: Spending speed vs Time speed.
 * 3. Velocity: Goal funding speed.
 */
export const ActivePlanHeader = () => {
  const { score, status, burnRatePacing, goalVelocity, liquidityRatio, fundingGap, isLoading } =
    useSystemHealth();

  if (isLoading) return null;

  // Dynamic Colors & Text
  let statusColor = "$healthGood";
  let statusBg = "$green2";
  let statusText = "SYSTEM OPTIMAL";
  let statusIcon = <CheckCircle size={12} color="$healthGood" />;

  if (status === "CRITICAL") {
    statusColor = "$healthCritical";
    statusBg = "$red2";
    statusText = "SYSTEM CRITICAL";
    statusIcon = <AlertTriangle size={12} color="$healthCritical" />;
  } else if (status === "WARNING") {
    statusColor = "$healthWarning";
    statusBg = "$orange2";
    statusText = "PACING WARNING";
    statusIcon = <Activity size={12} color="$healthWarning" />;
  }

  return (
    <GlassWidget marginBottom="$4">
      <YStack space="$3">
        {/* Header Row */}
        <XStack justifyContent="space-between" alignItems="center">
          <XStack space="$2" alignItems="center">
            <TrendingUp size={18} color="$color" />
            <H4 size="$4" fontWeight="bold">
              System Health
            </H4>
          </XStack>
          <XStack
            space="$1.5"
            alignItems="center"
            bg={statusBg as any}
            px="$2"
            py="$1"
            borderRadius="$4"
          >
            {statusIcon}
            <Text fontSize={11} color={statusColor as any} fontWeight="600">
              {statusText} • {score}
            </Text>
          </XStack>
        </XStack>

        <Separator />

        {/* Metrics Grid */}
        <XStack gap="$2" justifyContent="space-between">
          {/* Burn Rate Pacing */}
          <YStack flex={1} space="$1">
            <Text fontSize={11} color="$secondaryText">
              Burn Rate Pacing
            </Text>
            <XStack alignItems="center" space="$1.5">
              <Activity size={14} color={burnRatePacing > 1.2 ? "$red10" : "$color"} />
              <Text
                fontSize={14}
                fontWeight="bold"
                color={burnRatePacing > 1.2 ? "$red10" : "$color"}
              >
                {burnRatePacing.toFixed(2)}x
              </Text>
            </XStack>
            <Progress value={Math.min((burnRatePacing / 2) * 100, 100)} size="$1" mt="$1">
              <Progress.Indicator bg={burnRatePacing > 1.2 ? "$red10" : ("$green10" as any)} />
            </Progress>
          </YStack>

          {/* Separator Line */}
          <Separator vertical height={30} />

          {/* Goal Velocity */}
          <YStack flex={1} space="$1" alignItems="flex-end">
            <Text fontSize={11} color="$secondaryText">
              Goal Velocity
            </Text>
            <XStack alignItems="center" space="$1.5">
              <Text
                fontSize={14}
                fontWeight="bold"
                color={goalVelocity > 0.8 ? "$green10" : "$color"}
              >
                {(goalVelocity * 100).toFixed(0)}%
              </Text>
              <Target size={14} color={goalVelocity > 0.8 ? "$green10" : "$color"} />
            </XStack>
            <Progress value={Math.min(goalVelocity * 100, 100)} size="$1" mt="$1">
              <Progress.Indicator bg={goalVelocity > 0.8 ? "$green10" : ("$orange10" as any)} />
            </Progress>
          </YStack>
        </XStack>

        {/* Insight/Warning Footer */}
        {liquidityRatio < 1.0 && (
          <XStack bg="$red2" p="$2" borderRadius="$3" space="$2" alignItems="center" mt="$1">
            <AlertTriangle size={16} color="$red10" />
            <Paragraph fontSize={12} color="$red11" flex={1}>
              Liquidity Shortfall: {formatBalance(Math.abs(fundingGap))}. Deposit funds to secure
              plan.
            </Paragraph>
          </XStack>
        )}
      </YStack>
    </GlassWidget>
  );
};
