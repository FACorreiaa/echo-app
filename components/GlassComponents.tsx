import { Button, Card, Input, View, styled } from "tamagui";

// Global Glass Properties
export const glassProps: any = {
  backgroundColor: "$glassBackground",
  borderWidth: 1,
  borderColor: "$glassBorder",
  shadowColor: "$glassShadow",
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.1,
  // Note: For real blur, we need expo-blur or CSS backdrop-filter.
  // Tamagui handles platform specific styles often, but here we add web-only prop
  // for completeness.
  ...(process.env.TAMAGUI_TARGET === "web"
    ? {
        style: { backdropFilter: "blur(12px)" },
      }
    : {}),
};

export const GlassButton = styled(Button, {
  ...glassProps,
  backgroundColor: "$glassBackground",
  color: "$color",
  hoverStyle: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderColor: "rgba(255,255,255,0.2)",
  },
  pressStyle: {
    scale: 0.97,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
});

export const GlassCard = styled(Card, {
  ...glassProps,
  padding: "$4",
  borderRadius: "$4",
});

export const GlassInput = styled(Input, {
  ...glassProps,
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "$color",
  placeholderTextColor: "$placeholderColor",
  focusStyle: {
    borderColor: "$accentColor",
    borderWidth: 1,
  },
});

export const GlassView = styled(View, {
  ...glassProps,
});
