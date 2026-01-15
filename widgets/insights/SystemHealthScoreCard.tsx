import { GlassWidget } from "@/components/GlassWidget";
import { useSystemHealth } from "@/lib/hooks/use-system-health";
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from "@tamagui/lucide-icons";
import React from "react";
import { H2, H4, Paragraph, SizableText, View, XStack, YStack, useTheme } from "tamagui";

export const SystemHealthScoreCard = () => {
  const { score, status, isLoading } = useSystemHealth();
  const theme = useTheme();

  if (isLoading) return null;

  // Determine colors and icon based on status
  let statusColor = "$green10";
  let ringColor = "$green8";
  let StatusIcon = CheckCircle;
  let statusText = "SYSTEM OPTIMAL";

  if (status === "WARNING") {
    statusColor = "$healthWarning";
    ringColor = "$orange8";
    StatusIcon = Activity;
    statusText = "PACING WARNING";
  } else if (status === "CRITICAL") {
    statusColor = "$healthCritical";
    ringColor = "$red8";
    StatusIcon = AlertTriangle;
    statusText = "CRITICAL STATUS";
  }

  return (
    <GlassWidget marginBottom="$4" animation="bouncy">
      <YStack space="$3" alignItems="center">
        {/* Header */}
        <XStack alignItems="center" space="$2">
          <TrendingUp size={14} color="$secondaryText" />
          <SizableText size="$2" color="$secondaryText" textTransform="uppercase" letterSpacing={1}>
            System Health
          </SizableText>
        </XStack>

        {/* Score Ring with Pulse */}
        <View
          from={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={
            {
              type: "timing",
              duration: 2000,
              loop: true,
            } as any
          }
          style={{
            position: "absolute",
            top: 40,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: (theme[ringColor] as any)?.val || ringColor,
            opacity: 0.2,
            zIndex: -1,
          }}
        />

        <YStack
          alignItems="center"
          justifyContent="center"
          width={100}
          height={100}
          backgroundColor={"transparent" as any}
          borderRadius={50}
          borderWidth={4}
          borderColor={statusColor as any}
        >
          <H2 color={statusColor as any} fontWeight="800">
            {Math.round(score)}
          </H2>
        </YStack>

        {/* Status Badge */}
        <YStack alignItems="center" space="$1">
          <StatusIcon size={20} color={statusColor as any} />
          <H4 color={statusColor as any}>{statusText}</H4>
          <Paragraph size="$2" color="$secondaryText" textAlign="center">
            {status === "HEALTHY"
              ? "You are on track to fund all goals."
              : status === "WARNING"
                ? "Spending is outpacing time."
                : "Immediate attention required."}
          </Paragraph>
        </YStack>
      </YStack>
    </GlassWidget>
  );
};
