import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import { StyleSheet } from "react-native";
import { YStack } from "tamagui";

import { useTheme } from "@/contexts/ThemeContext";

export const GradientBackground = React.memo(({ children }: { children?: React.ReactNode }) => {
  const { isLight } = useTheme();

  // Static gradient background with adaptive theming
  const gradientColors = useMemo(() => {
    if (isLight) {
      // Light mode: Clean, bright, minimal
      return [
        "#f8fafc", // Top: almost white
        "#f1f5f9", // Middle: light gray
        "#e2e8f0", // Bottom: soft gray
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
