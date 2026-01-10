import { Card, styled } from "tamagui";

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
  shadowOpacity: 0.1,

  // Default variants
  variants: {
    elevate: {
      true: {
        shadowColor: "$glassShadow",
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
      },
    },
  } as const,
});
