/**
 * AliveBackground - Animated background with Skia (native) or CSS gradient (web)
 * Inspired by Fuse app: "three circles with a blur filter"
 */

import { useEffect } from "react";
import { Platform, StyleSheet, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "tamagui/linear-gradient";

interface AliveBackgroundProps {
  /** Whether the keyboard is visible - affects blob positions */
  isKeyboardVisible?: boolean;
  /** Primary color for the main blob */
  primaryColor?: string;
  /** Secondary color for the accent blob */
  secondaryColor?: string;
  /** Tertiary color for the subtle blob */
  tertiaryColor?: string;
}

// Web fallback component using CSS gradients
function WebBackground({ isKeyboardVisible }: { isKeyboardVisible?: boolean }) {
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(0.8, { duration: 3000 }), withTiming(0.6, { duration: 3000 })),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: isKeyboardVisible ? 1.1 : 1 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
      <LinearGradient
        colors={["#6366F1", "#8B5CF6", "#06B6D4", "#1a1a2e"]}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

// Native component using Skia
function NativeBackground({
  isKeyboardVisible = false,
  primaryColor = "#6366F1",
  secondaryColor = "#8B5CF6",
  tertiaryColor = "#06B6D4",
}: AliveBackgroundProps) {
  // Dynamically import Skia to avoid web bundling issues
  const {
    Canvas,
    Circle,
    Group,
    BlurMask,
    LinearGradient: SkiaGradient,
    vec,
  } = require("@shopify/react-native-skia");
  const { width, height } = useWindowDimensions();

  // Animated values for blob positions
  const blob1Y = useSharedValue(height * 0.3);
  const blob3Y = useSharedValue(height * 0.85);

  // Subtle autonomous movement
  const drift1 = useSharedValue(0);
  const drift2 = useSharedValue(0);
  const drift3 = useSharedValue(0);

  useEffect(() => {
    drift1.value = withRepeat(
      withSequence(
        withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    drift2.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(15, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    drift3.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-25, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [drift1, drift2, drift3]);

  useEffect(() => {
    const targetY1 = isKeyboardVisible ? height * 0.15 : height * 0.3;
    const targetY3 = isKeyboardVisible ? height * 0.5 : height * 0.85;

    blob1Y.value = withTiming(targetY1, { duration: 400, easing: Easing.out(Easing.cubic) });
    blob3Y.value = withTiming(targetY3, { duration: 400, easing: Easing.out(Easing.cubic) });
  }, [isKeyboardVisible, height, blob1Y, blob3Y]);

  const blob1CY = useDerivedValue(() => blob1Y.value + drift1.value);
  const blob2CX = useDerivedValue(() => width * 0.8 + drift2.value);
  const blob3CY = useDerivedValue(() => blob3Y.value + drift3.value);

  return (
    <Canvas style={StyleSheet.absoluteFill}>
      <Group>
        <BlurMask blur={80} style="normal" />
        <Circle cx={width * 0.25} cy={blob1CY} r={180} color={primaryColor} opacity={0.6} />
        <Circle cx={blob2CX} cy={height * 0.55} r={220} color={secondaryColor} opacity={0.5} />
        <Circle cx={width * 0.5} cy={blob3CY} r={200} color={tertiaryColor} opacity={0.4} />
      </Group>
      <Circle cx={width / 2} cy={height} r={height * 0.8}>
        <SkiaGradient
          start={vec(width / 2, height)}
          end={vec(width / 2, 0)}
          colors={["rgba(255,255,255,0.1)", "transparent"]}
        />
      </Circle>
    </Canvas>
  );
}

export function AliveBackground(props: AliveBackgroundProps) {
  // Use CSS gradient fallback on web, Skia on native
  if (Platform.OS === "web") {
    return <WebBackground isKeyboardVisible={props.isKeyboardVisible} />;
  }

  return <NativeBackground {...props} />;
}
