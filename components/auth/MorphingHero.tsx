/**
 * MorphingHero - Animated hero text that scales/moves with keyboard
 * Uses Moti for spring-based animations synchronized with keyboard state
 */

import { MotiView } from "moti";
import { Text, YStack } from "tamagui";

interface MorphingHeroProps {
  /** Whether the keyboard is visible */
  isKeyboardVisible?: boolean;
  /** Main title text */
  title?: string;
  /** Subtitle text */
  subtitle?: string;
}

export function MorphingHero({
  isKeyboardVisible = false,
  title = "Echo",
  subtitle = "The Alive Money OS",
}: MorphingHeroProps) {
  return (
    <MotiView
      animate={{
        scale: isKeyboardVisible ? 0.7 : 1,
        translateY: isKeyboardVisible ? -40 : 0,
        opacity: isKeyboardVisible ? 0.9 : 1,
      }}
      transition={{
        type: "spring",
        damping: 15,
        stiffness: 100,
      }}
    >
      <YStack alignItems="center" gap="$2">
        <Text
          fontSize={isKeyboardVisible ? 36 : 52}
          fontWeight="900"
          color="$color"
          textAlign="center"
          style={{
            textShadowColor: "rgba(0,0,0,0.3)",
            textShadowOffset: { width: 0, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {title}
        </Text>

        <MotiView
          animate={{
            opacity: isKeyboardVisible ? 0 : 1,
            scale: isKeyboardVisible ? 0.8 : 1,
          }}
          transition={{
            type: "spring",
            damping: 20,
          }}
        >
          <Text color="$color" opacity={0.8} fontSize="$5" textAlign="center" fontFamily="$body">
            {subtitle}
          </Text>
        </MotiView>
      </YStack>
    </MotiView>
  );
}
