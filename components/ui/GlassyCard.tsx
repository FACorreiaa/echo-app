import React from "react";
import { GetProps, styled, YStack } from "tamagui";

/**
 * GlassyCard - Now using Tactical HUD styling
 *
 * Updated to use the Tactical HUD aesthetic instead of glassmorphism.
 * This provides better performance on mobile and a more distinctive OS feel.
 */
const CardFrame = styled(YStack, {
  borderRadius: 4, // Sharp tactical corners
  borderWidth: 1,
  borderColor: "$hudBorder",
  padding: 20,
  backgroundColor: "$hudDepth",
  // Tactical glow shadow
  shadowColor: "$hudGlow",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.15,
  shadowRadius: 15,
  elevation: 8,
});

export type GlassyCardProps = GetProps<typeof CardFrame> & {
  intensity?: number;
  /** Force dark styling regardless of theme (for pages with dark backgrounds) */
  forceDark?: boolean;
  /** Enhanced holographic glow effect */
  holographic?: boolean;
  /** Variant for different HUD states */
  variant?: "default" | "active" | "warning";
};

export const GlassyCard = React.memo((props: GlassyCardProps) => {
  const { holographic: _holographic = false, variant = "default", ...restProps } = props;

  // Determine border and shadow colors based on variant
  const getBorderColor = () => {
    switch (variant) {
      case "active":
        return "$hudActive";
      case "warning":
        return "$hudWarning";
      default:
        return "$hudBorder";
    }
  };

  const getShadowColor = () => {
    switch (variant) {
      case "active":
        return "$hudActive";
      case "warning":
        return "$hudWarning";
      default:
        return "$hudGlow";
    }
  };

  return (
    <CardFrame
      {...restProps}
      position="relative"
      backgroundColor="$hudDepth"
      borderColor={getBorderColor()}
      shadowColor={getShadowColor()}
      shadowOpacity={variant === "default" ? 0.15 : 0.25}
    >
      {/* Content */}
      <YStack zIndex={1} space>
        {props.children}
      </YStack>
    </CardFrame>
  );
});
