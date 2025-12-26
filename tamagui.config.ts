import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui } from "tamagui";

const config = createTamagui({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    color: {
      ...defaultConfig.tokens.color,
      // Custom Palette
      deepBlue: "#0b0f19",
      electricBlue: "#2da6fa",
      glassWhite: "rgba(255, 255, 255, 0.1)",
      glassBorder: "rgba(255, 255, 255, 0.08)",

      // Light mode specifics
      cleanWhite: "#ffffff",
      slateText: "#1B1D2A",
      softGray: "#f2f2f2",

      // Aliases that will be used in themes
      textPrimaryDark: "#ffffff",
      textSecondaryDark: "#a0a0a0",

      textPrimaryLight: "#000000",
      textSecondaryLight: "#666666",
    },
  },
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      background: "#ffffff",
      backgroundHover: "#f5f5f5",
      backgroundPress: "#e0e0e0",
      backgroundFocus: "#ffffff",
      color: "#000000",
      colorHover: "#333333",
      colorPress: "#000000",
      colorFocus: "#000000",
      borderColor: "#e5e5e5",
      shadowColor: "rgba(0,0,0,0.1)",
      // Custom tokens mapped to semantic names if needed
      glassBorder: "#e5e5e5", // Fallback for glass in light mode
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: "#0b0f19", // deepBlue
      backgroundHover: "#131929",
      backgroundPress: "#05080e",
      backgroundFocus: "#0b0f19",
      color: "#ffffff",
      colorHover: "#e0e0e0",
      colorPress: "#ffffff",
      colorFocus: "#ffffff",
      borderColor: "rgba(255, 255, 255, 0.08)",
      shadowColor: "rgba(0,0,0,0.5)",
      glassBorder: "rgba(255, 255, 255, 0.08)",
    },
  },
  media: {
    ...defaultConfig.media,
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  },
  fonts: {
    ...defaultConfig.fonts,
    heading: defaultConfig.fonts.heading,
    body: defaultConfig.fonts.body,
  },
});

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
