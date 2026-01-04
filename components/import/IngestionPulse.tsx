import { Activity, CheckCircle2, Database, FileSpreadsheet, Search } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Circle, Text, XStack, YStack } from "tamagui";

const STEPS = [
  { text: "Reading file contents...", icon: Activity, emoji: "📄" },
  { text: "Identifying bank format...", icon: Search, emoji: "🔍" },
  { text: "Normalizing regional math...", icon: Database, emoji: "🔢" },
  { text: "Detecting duplicate entries...", icon: CheckCircle2, emoji: "🛡️" },
  { text: "Preparing your data...", icon: FileSpreadsheet, emoji: "✨" },
];

interface IngestionPulseProps {
  /** Optional custom messages to cycle through */
  messages?: string[];
  /** Interval between message changes in ms */
  intervalMs?: number;
}

/**
 * IngestionPulse - An animated "analyzing" state component.
 * Displays a pulsing animation with rotating status messages
 * to make the ingestion process feel "Alive".
 */
export const IngestionPulse = ({ messages, intervalMs = 2000 }: IngestionPulseProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = messages
    ? messages.map((text, i) => ({
        text,
        icon: STEPS[i % STEPS.length].icon,
        emoji: STEPS[i % STEPS.length].emoji,
      }))
    : STEPS;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [steps.length, intervalMs]);

  return (
    <YStack flex={1} alignItems="center" justifyContent="center" gap="$8" padding="$4">
      {/* The Pulsing Core */}
      <YStack alignItems="center" justifyContent="center">
        <Circle size={120} backgroundColor="$blue5" alignItems="center" justifyContent="center">
          <Text fontSize={48}>{steps[currentStep].emoji}</Text>
        </Circle>

        {/* Outer Halo Pulse */}
        <Circle position="absolute" size={160} borderWidth={2} borderColor="$blue5" opacity={0.5} />

        {/* Loading indicator */}
        <YStack position="absolute" bottom={-40}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </YStack>
      </YStack>

      {/* Narrative Text */}
      <YStack alignItems="center" gap="$2" minHeight={60}>
        <Animated.View
          key={currentStep}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
        >
          <Text fontSize="$6" fontWeight="600" textAlign="center" color="$color">
            {steps[currentStep].text}
          </Text>
        </Animated.View>
        <Text color="$secondaryText" fontSize="$3">
          This usually takes just a few seconds.
        </Text>
      </YStack>

      {/* Progress dots */}
      <XStack gap="$2">
        {steps.map((_, index) => (
          <Circle
            key={index}
            size={8}
            backgroundColor={index === currentStep ? "$accentColor" : ("$gray6" as any)}
            opacity={index === currentStep ? 1 : 0.5}
          />
        ))}
      </XStack>
    </YStack>
  );
};

export default IngestionPulse;
