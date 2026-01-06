/**
 * EchoSplashScreen - Fast, minimal, brand-focused splash screen
 *
 * Key Principles:
 * - 1-3 seconds max
 * - Centered logo with subtle animation
 * - Optional loading indicator
 * - Smooth transition out
 */

import { MotiText, MotiView } from "moti";
import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { Text, useTheme, YStack } from "tamagui";

interface EchoSplashScreenProps {
  /** Minimum display time in ms (default: 1500) */
  minDuration?: number;
  /** Whether data is still loading */
  isLoading?: boolean;
  /** Callback when splash should hide */
  onReady?: () => void;
}

export function EchoSplashScreen({
  minDuration = 1500,
  isLoading = false,
  onReady,
}: EchoSplashScreenProps) {
  const theme = useTheme();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // Get theme-aware text color
  const textColor = theme.color?.val || "#000000";

  // Ensure minimum display time
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinTimeElapsed(true);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration]);

  // Trigger onReady when both conditions are met
  useEffect(() => {
    if (minTimeElapsed && !isLoading && onReady) {
      onReady();
    }
  }, [minTimeElapsed, isLoading, onReady]);

  return (
    <YStack flex={1} backgroundColor="$background" alignItems="center" justifyContent="center">
      {/* Logo Animation - Fade in and subtle scale */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: "timing",
          duration: 600,
        }}
      >
        <YStack alignItems="center" gap="$3">
          {/* Echo Logo Text */}
          <MotiText
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 200 }}
            style={[styles.logoText, { color: textColor }]}
          >
            Echo
          </MotiText>

          {/* Tagline */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            transition={{ type: "timing", duration: 400, delay: 400 }}
          >
            <Text color="$color" fontSize="$4" fontFamily="$body" opacity={0.7}>
              The Alive Money OS
            </Text>
          </MotiView>
        </YStack>
      </MotiView>

      {/* Loading Indicator - Only shows if still loading after animation */}
      {isLoading && minTimeElapsed && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.loadingContainer}>
          <LoadingDots />
        </MotiView>
      )}
    </YStack>
  );
}

/**
 * Simple animated loading dots
 */
function LoadingDots() {
  return (
    <MotiView style={styles.dotsContainer}>
      {[0, 1, 2].map((index) => (
        <MotiView
          key={index}
          from={{ opacity: 0.3, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "timing",
            duration: 600,
            loop: true,
            delay: index * 200,
          }}
          style={styles.dot}
        />
      ))}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  logoText: {
    fontSize: 56,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
  },
  loadingContainer: {
    position: "absolute",
    bottom: 100,
  },
  dotsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
  },
});
