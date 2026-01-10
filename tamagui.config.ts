import { defaultConfig } from "@tamagui/config/v4";
import { createFont, createTamagui } from "tamagui";

// Define Outfit font with all weights
const outfitFont = createFont({
  family: "Outfit_400Regular",
  size: {
    1: 11,
    2: 12,
    3: 13,
    4: 14,
    true: 14,
    5: 16,
    6: 18,
    7: 20,
    8: 23,
    9: 30,
    10: 46,
    11: 55,
    12: 62,
    13: 72,
    14: 92,
    15: 114,
    16: 134,
  },
  lineHeight: {
    1: 15,
    2: 16,
    3: 18,
    4: 20,
    true: 20,
    5: 22,
    6: 24,
    7: 28,
    8: 30,
    9: 38,
    10: 54,
  },
  weight: {
    4: "400",
    5: "500",
    7: "700",
  },
  letterSpacing: {
    4: 0,
    5: -0.5,
    7: -0.5,
  },
  face: {
    400: { normal: "Outfit_400Regular" },
    500: { normal: "Outfit_500Medium" },
    700: { normal: "Outfit_700Bold" },
  },
});

// Heading font (bold)
const headingFont = createFont({
  ...outfitFont,
  family: "Outfit_700Bold",
  face: {
    400: { normal: "Outfit_700Bold" },
    500: { normal: "Outfit_700Bold" },
    700: { normal: "Outfit_700Bold" },
  },
});

const config = createTamagui({
  ...defaultConfig,
  settings: {
    ...defaultConfig.settings,
    onlyAllowShorthands: false,
  },
  // In Tamagui v4, tokens don't have a color property - colors are in themes
  tokens: {
    ...defaultConfig.tokens,
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
      // Custom semantic tokens
      glassBorder: "#e5e7eb",
      glassWhite: "rgba(255, 255, 255, 0.9)",
      cardBackground: "#ffffff",
      listItemBackground: "#f9fafb",
      accentGradientStart: "#6366f1",
      accentGradientEnd: "#8b5cf6",
      accentColor: "#6366f1",
      secondaryText: "#6b7280",
      // Additional color tokens
      deepBlue: "#0b0f19",
      electricBlue: "#2da6fa",
      // Health Colors
      healthGood: "#22c55e",
      healthWarning: "#f59e0b",
      healthCritical: "#ef4444",
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
      // Custom semantic tokens
      glassBorder: "rgba(255, 255, 255, 0.15)",
      glassWhite: "rgba(255, 255, 255, 0.15)",
      cardBackground: "rgba(255, 255, 255, 0.08)",
      listItemBackground: "rgba(255, 255, 255, 0.05)",
      accentGradientStart: "#2da6fa",
      accentGradientEnd: "#6366f1",
      accentColor: "#2da6fa",
      secondaryText: "#9ca3af",
      // Additional color tokens
      deepBlue: "#0b0f19",
      electricBlue: "#2da6fa",
      // Health Colors
      healthGood: "#22c55e",
      healthWarning: "#f59e0b",
      healthCritical: "#ef4444",
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
    // Register Outfit fonts as tokens
    heading: headingFont,
    body: outfitFont,
  },
});

export type Conf = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends Conf {}
}

export default config;
