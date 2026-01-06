/**
 * EchoSplashScreen - Fast, minimal, brand-focused splash screen
 *
 * Key Principles:
 * - 1-3 seconds max
 * - Centered logo with subtle animation
 * - Theme-aware colors (dark/light mode)
 * - Smooth transition out
 */

import { MotiView } from "moti";
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

  // Theme-aware colors with good contrast
  const primaryColor = theme.electricBlue?.val || "#6366F1";

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
          {/* Echo Logo Text - Uses theme color for dark/light mode */}
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 500, delay: 200 }}
          >
            <Text
              fontSize={56}
              fontWeight="900"
              color="$color"
              textAlign="center"
              letterSpacing={-1}
              accessibilityRole="header"
              accessibilityLabel="Echo"
            >
              Echo
            </Text>
          </MotiView>

          {/* Tagline - Uses theme color with reduced opacity */}
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: "timing", duration: 400, delay: 400 }}
          >
            <Text
              color="$colorHover"
              fontSize="$4"
              fontFamily="$body"
              accessibilityLabel="The Alive Money OS"
            >
              The Alive Money OS
            </Text>
          </MotiView>
        </YStack>
      </MotiView>

      {/* Loading Indicator - Theme-aware dot color */}
      {isLoading && minTimeElapsed && (
        <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.loadingContainer}>
          <LoadingDots dotColor={primaryColor} />
        </MotiView>
      )}
    </YStack>
  );
}

/**
 * Simple animated loading dots with theme-aware colors
 */
function LoadingDots({ dotColor }: { dotColor: string }) {
  return (
    <MotiView style={styles.dotsContainer} accessibilityLabel="Loading">
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
          style={[styles.dot, { backgroundColor: dotColor }]}
        />
      ))}
    </MotiView>
  );
}

const styles = StyleSheet.create({
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
  },
});

// Alias for widget export
export { EchoSplashScreen as SplashWidget };
