import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { GetProps, styled, YStack } from "tamagui";

// Create a configured YStack for the card container with holographic glass styling
const CardFrame = styled(YStack, {
  borderRadius: 24,
  borderWidth: 1.5,
  borderColor: "$glassBorder",
  padding: 24,
  overflow: "hidden",
  backgroundColor: "$glassWhite",
  // Holographic glow shadow
  shadowColor: "$glassShadow",
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 1,
  shadowRadius: 24,
  elevation: 8,
});

export type GlassyCardProps = GetProps<typeof CardFrame> & {
  intensity?: number;
  /** Force dark styling regardless of theme (for pages with dark backgrounds) */
  forceDark?: boolean;
  /** Enhanced holographic glow effect */
  holographic?: boolean;
};

export const GlassyCard = React.memo((props: GlassyCardProps) => {
  const { isDark } = useTheme();
  const { holographic = true, ...restProps } = props;

  // Use dark styling if either system is dark mode OR forceDark is true
  const useDarkStyle = isDark || props.forceDark;

  return (
    <CardFrame
      {...restProps}
      position="relative"
      backgroundColor={useDarkStyle ? "$glassWhite" : "$glassBackground"}
      borderColor={useDarkStyle ? "$glassBorder" : "$glassBorder"}
      // Enhanced shadow for holographic depth
      shadowColor={holographic ? (useDarkStyle ? "$glowCyan" : "$glowBlue") : "$glassShadow"}
      shadowOpacity={holographic ? (useDarkStyle ? 0.6 : 0.3) : 1}
      shadowRadius={holographic ? 32 : 24}
    >
      <BlurView
        intensity={props.intensity ?? (useDarkStyle ? 40 : 60)}
        style={StyleSheet.absoluteFill}
        tint={useDarkStyle ? "dark" : "light"}
      />
      {/* Holographic highlight overlay for layered depth */}
      {holographic && (
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          height="40%"
          backgroundColor={useDarkStyle ? "$glowCyan" : "$glowBlue"}
          opacity={useDarkStyle ? 0.08 : 0.05}
          pointerEvents="none"
        />
      )}
      {/* Content sits on top of the blur and effects */}
      <YStack zIndex={1} space>
        {props.children}
      </YStack>
    </CardFrame>
  );
});
