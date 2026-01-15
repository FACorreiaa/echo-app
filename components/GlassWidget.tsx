import { Card, styled } from "tamagui";

// Web-only styles for backdrop blur
const webStyles =
  process.env.TAMAGUI_TARGET === "web"
    ? {
        style: { backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" },
      }
    : {};

export const GlassWidget = styled(Card, {
  name: "GlassWidget",
  backgroundColor: "$glassBackground",
  borderWidth: 1,
  borderColor: "$glassBorder",
  borderRadius: "$6",
  padding: "$4",

  // Shadow for depth
  shadowColor: "$glassShadow",
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,

  // Web backdrop blur
  ...webStyles,

  // Variants for flexible usage
  variants: {
    elevate: {
      true: {
        shadowColor: "$glassShadow",
        shadowRadius: 30,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        backgroundColor: "$glassHighlight",
      },
    },
    size: {
      small: {
        padding: "$2",
        borderRadius: "$4",
      },
      medium: {
        padding: "$4",
        borderRadius: "$6",
      },
      large: {
        padding: "$6",
        borderRadius: "$8",
      },
    },
    glow: {
      true: {
        borderColor: "$accentColor",
        shadowColor: "$accentColor",
        shadowOpacity: 0.3,
      },
    },
  } as const,

  defaultVariants: {
    size: "medium",
  },
});
