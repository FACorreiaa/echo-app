/**
 * MorphingHero - Animated hero text that scales/moves with keyboard
 * Uses Reanimated worklets for UI thread execution (60 FPS even during JS work)
 * Enhanced with holographic futuristic OS aesthetic
 */

import React from "react";
import Animated, { useAnimatedStyle, withSpring } from "react-native-reanimated";
import { Text, YStack, useTheme } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

interface MorphingHeroProps {
  /** Whether the keyboard is visible */
  isKeyboardVisible?: boolean;
  /** Main title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
}

export const MorphingHero = React.memo(function MorphingHero({
  isKeyboardVisible = false,
  title = "Echo",
  subtitle = "The Alive Money OS",
}: MorphingHeroProps) {
  const theme = useTheme();

  // Animated styles run on UI thread via worklets
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isKeyboardVisible ? 0.7 : 1, { damping: 15, stiffness: 100 }) },
        { translateY: withSpring(isKeyboardVisible ? -40 : 0, { damping: 15, stiffness: 100 }) },
      ],
      opacity: withSpring(isKeyboardVisible ? 0.9 : 1, { damping: 15, stiffness: 100 }),
    };
  });

  const subtitleStyle = useAnimatedStyle(() => {
    return {
      opacity: withSpring(isKeyboardVisible ? 0 : 1, { damping: 20 }),
      transform: [{ scale: withSpring(isKeyboardVisible ? 0.8 : 1, { damping: 20 }) }],
    };
  });

  return (
    <Animated.View style={containerStyle}>
      <YStack alignItems="center" gap="$2">
        {/* Holographic gradient text */}
        <MaskedView
          maskElement={
            <Text fontSize={isKeyboardVisible ? 36 : 52} fontWeight="900" textAlign="center">
              {title}
            </Text>
          }
        >
          <LinearGradient
            colors={[
              theme.cyan?.val || "#00d9ff",
              theme.electricBlue?.val || "#2da6fa",
              theme.purple?.val || "#b47aff",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 4 }}
          >
            <Text
              fontSize={isKeyboardVisible ? 36 : 52}
              fontWeight="900"
              opacity={0}
              textAlign="center"
            >
              {title}
            </Text>
          </LinearGradient>
        </MaskedView>

        <Animated.View style={subtitleStyle}>
          <Text
            color="$secondaryText"
            fontSize="$5"
            textAlign="center"
            fontFamily="$body"
            style={{
              textShadowColor: theme.glowCyan?.val || "rgba(0, 217, 255, 0.4)",
              textShadowOffset: { width: 0, height: 0 },
              textShadowRadius: 8,
            }}
          >
            {subtitle}
          </Text>
        </Animated.View>
      </YStack>
    </Animated.View>
  );
});
