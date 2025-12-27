import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Text, YStack } from "tamagui";

interface LoginTransitionProps {
  isAnimating: boolean;
  onAnimationComplete?: () => void;
  children?: React.ReactNode;
}

/**
 * A success animation overlay that plays when user logs in.
 * Shows a branded success screen with a sweep animation.
 */
export const LoginSuccessAnimation = ({
  isAnimating,
  onAnimationComplete,
}: LoginTransitionProps) => {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (isAnimating) {
      // Start animation sequence
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });

      // Progress bar animation
      progress.value = withTiming(1, { duration: 800 }, (finished) => {
        if (finished && onAnimationComplete) {
          // Fade out and callback
          opacity.value = withTiming(0, { duration: 300 }, (done) => {
            if (done) {
              runOnJS(onAnimationComplete)();
            }
          });
        }
      });
    }
  }, [isAnimating]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  if (!isAnimating) return null;

  return (
    <Animated.View style={[styles.overlay, containerStyle]}>
      <LinearGradient colors={["#0b0f19", "#1a1f2e"]} style={StyleSheet.absoluteFill} />
      <YStack alignItems="center" gap={24}>
        <Animated.View style={logoStyle}>
          <YStack
            width={100}
            height={100}
            borderRadius={50}
            backgroundColor="$accentGradientStart"
            alignItems="center"
            justifyContent="center"
          >
            <Text color="white" fontSize={40} fontFamily="$heading">
              ✓
            </Text>
          </YStack>
        </Animated.View>

        <Text color="white" fontSize={24} fontFamily="$heading">
          Welcome to Echo
        </Text>

        <Text color="rgba(255,255,255,0.7)" fontSize={16}>
          Setting up your dashboard...
        </Text>

        {/* Progress bar */}
        <YStack
          width={200}
          height={4}
          backgroundColor="rgba(255,255,255,0.2)"
          borderRadius={2}
          overflow="hidden"
        >
          <Animated.View style={[styles.progressBar, progressStyle]} />
        </YStack>
      </YStack>
    </Animated.View>
  );
};

/**
 * Wraps content with fade-in animation for screen transitions
 */
export const FadeInScreen = ({ children }: { children: React.ReactNode }) => {
  return (
    <Animated.View
      style={styles.screen}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#2da6fa",
    borderRadius: 2,
  },
  screen: {
    flex: 1,
  },
});
