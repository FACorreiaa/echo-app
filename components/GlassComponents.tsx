import { Button, Card, Input, View, styled } from "tamagui";

// Web-only styles for backdrop blur
const webBlurStyles =
  process.env.TAMAGUI_TARGET === "web"
    ? {
        style: { backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" },
      }
    : {};

// Global Glass Properties - shared across all glass components
export const glassProps: any = {
  backgroundColor: "$glassBackground",
  borderWidth: 1,
  borderColor: "$glassBorder",
  shadowColor: "$glassShadow",
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  ...webBlurStyles,
};

export const GlassButton = styled(Button, {
  ...glassProps,
  backgroundColor: "$glassBackground",
  color: "$color",
  borderRadius: "$4",

  // Smooth animations
  animation: "quick",

  hoverStyle: {
    backgroundColor: "$glassHighlight",
    borderColor: "rgba(255,255,255,0.25)" as any,
    scale: 1.02,
  },
  pressStyle: {
    scale: 0.97,
    backgroundColor: "$glassBackground",
    opacity: 0.9,
  },
  focusStyle: {
    borderColor: "$accentColor",
    outlineColor: "$accentColor",
  },
});

export const GlassCard = styled(Card, {
  ...glassProps,
  padding: "$4",
  borderRadius: "$6",

  // Subtle hover lift effect
  hoverStyle: {
    shadowRadius: 30,
    shadowOpacity: 0.2,
  },
});

export const GlassInput = styled(Input, {
  ...glassProps,
  backgroundColor: "rgba(255,255,255,0.05)" as any,
  color: "$color",
  placeholderTextColor: "$placeholderColor",
  borderRadius: "$4",
  paddingHorizontal: "$3",

  // Focus glow effect
  focusStyle: {
    borderColor: "$accentColor",
    borderWidth: 2,
    shadowColor: "$accentColor",
    shadowRadius: 12,
    shadowOpacity: 0.3,
  },

  hoverStyle: {
    borderColor: "rgba(255,255,255,0.2)" as any,
  },
});

export const GlassView = styled(View, {
  ...glassProps,
  borderRadius: "$4",
});

// GlassPanel - for larger container areas
export const GlassPanel = styled(View, {
  ...glassProps,
  padding: "$5",
  borderRadius: "$8",

  variants: {
    elevated: {
      true: {
        backgroundColor: "$glassHighlight",
        shadowRadius: 30,
        shadowOpacity: 0.25,
      },
    },
  } as const,
});
