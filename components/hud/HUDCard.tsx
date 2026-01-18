import React from "react";
import { styled, YStack, YStackProps } from "tamagui";

/**
 * HUDCard - Tactical HUD Card Component
 *
 * Instead of heavy background blurs, we use 1px glowing borders
 * and inner shadows. This looks like a holographic panel and is
 * significantly more performant on Android and iOS.
 */
export const HUDCard = styled(YStack, {
  name: "HUDCard",
  backgroundColor: "$hudDepth",
  borderRadius: 4, // Sharp, tactical corners
  borderWidth: 1,
  borderColor: "$hudBorder",
  padding: "$4",
  position: "relative",

  // The "OS" Glow Effect
  shadowColor: "$hudGlow",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.15,
  shadowRadius: 15,

  variants: {
    variant: {
      default: {
        backgroundColor: "$hudDepth",
        borderColor: "$hudBorder",
      },
      active: {
        backgroundColor: "$hudDepth",
        borderColor: "$hudActive",
        shadowColor: "$hudActive",
        shadowOpacity: 0.3,
      },
      warning: {
        backgroundColor: "$hudDepth",
        borderColor: "$hudWarning",
        shadowColor: "$hudWarning",
        shadowOpacity: 0.2,
      },
    },
    withCornerBracket: {
      true: {
        // Corner bracket will be added via pseudo-element in a wrapper
      },
    },
  } as const,

  defaultVariants: {
    variant: "default",
  },
});

/**
 * HUDCardWithBracket - HUD Card with corner bracket decoration
 */
interface HUDCardWithBracketProps extends YStackProps {
  variant?: "default" | "active" | "warning";
  children?: React.ReactNode;
}

export const HUDCardWithBracket: React.FC<HUDCardWithBracketProps> = ({
  variant = "default",
  children,
  ...props
}) => {
  return (
    <YStack position="relative" {...props}>
      {/* Top-left corner bracket */}
      <YStack
        position="absolute"
        top={-1}
        left={-1}
        width={12}
        height={12}
        borderTopWidth={2}
        borderLeftWidth={2}
        borderColor={variant === "warning" ? "$hudWarning" : "$hudActive"}
        zIndex={10}
      />

      {/* Top-right corner bracket */}
      <YStack
        position="absolute"
        top={-1}
        right={-1}
        width={12}
        height={12}
        borderTopWidth={2}
        borderRightWidth={2}
        borderColor={variant === "warning" ? "$hudWarning" : "$hudActive"}
        zIndex={10}
      />

      <HUDCard variant={variant}>{children}</HUDCard>
    </YStack>
  );
};
