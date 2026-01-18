import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { YStack } from "tamagui";

/**
 * ScanLine - Tactical OS System Scan Animation
 *
 * A vertical gradient that "sweeps" across your data layers,
 * mimicking a system scanning for updates (like your ML parser).
 * This makes the OS feel "Alive".
 */
interface ScanLineProps {
  height?: number;
  duration?: number;
  opacity?: number;
}

export const ScanLine: React.FC<ScanLineProps> = ({
  height = 600,
  duration = 4000,
  opacity = 0.1,
}) => {
  const translateY = useSharedValue(-200);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(height, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [height, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      overflow="hidden"
      pointerEvents="none"
      zIndex={1}
    >
      <Animated.View style={[styles.scanLine, { opacity }, animatedStyle]} />
    </YStack>
  );
};

const styles = StyleSheet.create({
  scanLine: {
    height: 100,
    width: "100%",
    position: "absolute",
    // Note: Linear gradients need to be implemented differently in React Native
    // This is a simplified version - you may want to use react-native-linear-gradient
    backgroundColor: "rgba(45, 166, 250, 0.1)",
  },
});
