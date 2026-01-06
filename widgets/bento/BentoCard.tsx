/**
 * BentoCard - Unified card wrapper with size variants
 *
 * Sizes:
 * - small: 1x1 grid cell
 * - wide: 2x1 grid cells (horizontal)
 * - tall: 1x2 grid cells (vertical)
 * - full: Full width
 */

import { MotiView } from "moti";
import React from "react";
import { ViewStyle } from "react-native";
import { GetProps, styled, YStack } from "tamagui";

// Base card frame
const CardFrame = styled(YStack, {
  backgroundColor: "$backgroundHover",
  borderRadius: "$4",
  borderWidth: 1,
  borderColor: "$borderColor",
  overflow: "hidden",

  // Subtle shadow
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,

  variants: {
    size: {
      small: {
        minHeight: 120,
      },
      wide: {
        minHeight: 120,
      },
      tall: {
        minHeight: 260,
      },
      full: {
        minHeight: 200,
      },
    },
  } as const,

  defaultVariants: {
    size: "small",
  },
});

export type BentoCardSize = "small" | "wide" | "tall" | "full";

export interface BentoCardProps extends GetProps<typeof CardFrame> {
  size?: BentoCardSize;
  children: React.ReactNode;
  animated?: boolean;
  style?: ViewStyle;
}

export function BentoCard({
  size = "small",
  children,
  animated = true,
  style,
  ...props
}: BentoCardProps) {
  const content = (
    <CardFrame size={size} style={style} {...props}>
      {children}
    </CardFrame>
  );

  if (!animated) return content;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 300 }}
    >
      {content}
    </MotiView>
  );
}
