import { GlassyCard } from "@/components/ui/GlassyCard";
import { useSystemHealth } from "@/lib/hooks/use-system-health";
import { AlertCircle, ArrowRight, CheckCircle, Info, TrendingUp } from "@tamagui/lucide-icons";
import React from "react";
import { Button, Paragraph, XStack, YStack } from "tamagui";

// Simple heuristic to determine icon type from text content
const getIcon = (msg: string) => {
  const lower = msg.toLowerCase();
  if (lower.includes("risk") || lower.includes("crisis") || lower.includes("shortfall"))
    return <AlertCircle size={20} color="$healthCritical" />;
  if (lower.includes("track") || lower.includes("funded") || lower.includes("great"))
    return <CheckCircle size={20} color="$healthGood" />;
  if (lower.includes("spending") || lower.includes("pace"))
    return <TrendingUp size={20} color="$healthWarning" />;
  return <Info size={20} color="$blue10" />;
};

export const InsightSummaryCard = () => {
  const { insightMessages, isLoading } = useSystemHealth();

  if (isLoading || !insightMessages || insightMessages.length === 0) return null;

  return (
    <YStack space="$3" mb="$4">
      {insightMessages.map((msg, index) => (
        <GlassyCard key={index} p="$3" animation="quick">
          <XStack alignItems="center" space="$3">
            {getIcon(msg)}
            <YStack flex={1}>
              <Paragraph size="$3" color="$color" lineHeight={20}>
                {msg}
              </Paragraph>
            </YStack>
            <Button size="$2" chromeless icon={ArrowRight} opacity={0.5} />
          </XStack>
        </GlassyCard>
      ))}
    </YStack>
  );
};
