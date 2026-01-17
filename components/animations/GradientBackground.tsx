import React, { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { YStack } from "tamagui";

import { useTheme } from "@/contexts/ThemeContext";

export const GradientBackground = React.memo(({ children }: { children?: React.ReactNode }) => {
  const { isLight } = useTheme();

  // Static gradient background with futuristic finance OS aesthetic
  const gradientColors = useMemo(() => {
    if (isLight) {
      // Light mode: Soft futuristic gradient with subtle blue tint
      return [
        "#f5f7fa", // Top: soft gray-blue
        "#e8ecf4", // Middle: lighter blue-gray
        "#dce2ed", // Bottom: deeper blue-gray
      ] as const;
    } else {
      // Dark mode: Deep navy/charcoal with holographic depth
      return [
        "#0a0e27", // Top: deep navy
        "#0f1419", // Middle: charcoal blue
        "#050811", // Bottom: near black with blue tint
      ] as const;
    }
  }, [isLight]);

  return (
    <YStack flex={1} backgroundColor="$background">
      <LinearGradient
        colors={gradientColors}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {children}
    </YStack>
  );
});
