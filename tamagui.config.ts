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

      // Increased opacity for better contrast/visibility
      glassWhite: "rgba(255, 255, 255, 0.15)",
      glassBorder: "rgba(255, 255, 255, 0.15)",

      // Light mode specifics
      cleanWhite: "#ffffff",
      slateText: "#111827", // Darker slate for better contrast
      softGray: "#f3f4f6",

      // Aliases that will be used in themes
      textPrimaryDark: "#ffffff",
      textSecondaryDark: "#d1d5db", // Lighter grey for better dark mode contrast

      textPrimaryLight: "#0f172a", // Almost black
      textSecondaryLight: "#4b5563", // Darker grey for better light mode contrast
    },
  },
  themes: {
    ...defaultConfig.themes,
    light: {
      ...defaultConfig.themes.light,
      background: "#ffffff",
      backgroundHover: "#f9fafb",
      backgroundPress: "#f3f4f6",
      backgroundFocus: "#ffffff",
      color: "#0f172a",
      colorHover: "#374151",
      colorPress: "#0f172a",
      colorFocus: "#0f172a",
      borderColor: "#e5e7eb",
      shadowColor: "rgba(0,0,0,0.1)",
      glassBorder: "#e5e7eb",
      // New semantic tokens
      cardBackground: "#ffffff",
      listItemBackground: "#f9fafb",
      accentGradientStart: "#6366f1",
      accentGradientEnd: "#8b5cf6",
      secondaryText: "#6b7280",
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: "#0b0f19",
      backgroundHover: "#111827",
      backgroundPress: "#1f2937",
      backgroundFocus: "#0b0f19",
      color: "#ffffff",
      colorHover: "#e5e7eb",
      colorPress: "#ffffff",
      colorFocus: "#ffffff",
      borderColor: "rgba(255, 255, 255, 0.15)",
      shadowColor: "rgba(0,0,0,0.5)",
      glassBorder: "rgba(255, 255, 255, 0.15)",
      // New semantic tokens
      cardBackground: "rgba(255, 255, 255, 0.08)",
      listItemBackground: "rgba(255, 255, 255, 0.05)",
      accentGradientStart: "#2da6fa",
      accentGradientEnd: "#6366f1",
      secondaryText: "#9ca3af",
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
