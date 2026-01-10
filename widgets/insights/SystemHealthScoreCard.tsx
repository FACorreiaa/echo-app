import { GlassyCard } from "@/components/ui/GlassyCard";
import { useSystemHealth } from "@/lib/hooks/use-system-health";
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from "@tamagui/lucide-icons";
import { View } from "moti";
import React from "react";
import { H2, H4, Paragraph, SizableText, XStack, YStack, useTheme } from "tamagui";

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
    <GlassyCard p="$4" mb="$4" animation="bouncy">
      <YStack space="$3" ai="center">
        {/* Header */}
        <XStack ai="center" space="$2" opacity={0.8}>
          <TrendingUp size={14} color="$gray11" />
          <SizableText size="$2" color="$gray11" tt="uppercase" ls={1}>
            System Health
          </SizableText>
        </XStack>

        {/* Score Ring with Pulse */}
        <View
          from={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "timing",
            duration: 2000,
            loop: true,
            repeatReverse: true,
          }}
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
          ai="center"
          jc="center"
          width={100}
          height={100}
          bc="$backgroundTransparent"
          br={50}
          bw={4}
          borderColor={statusColor as any}
        >
          <H2 color={statusColor as any} fow="800">
            {Math.round(score)}
          </H2>
        </YStack>

        {/* Status Badge */}
        <YStack ai="center" space="$1">
          <StatusIcon size={20} color={statusColor as any} />
          <H4 color={statusColor as any}>{statusText}</H4>
          <Paragraph size="$2" color="$gray10" ta="center">
            {status === "HEALTHY"
              ? "You are on track to fund all goals."
              : status === "WARNING"
                ? "Spending is outpacing time."
                : "Immediate attention required."}
          </Paragraph>
        </YStack>
      </YStack>
    </GlassyCard>
  );
};
