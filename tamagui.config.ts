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
      background: "#F2F2F7", // Platinum for better glass contrast
      backgroundHover: "#e8e8ed",
      backgroundPress: "#dcdce2",
      backgroundFocus: "#F2F2F7",
      color: "#0f172a",
      colorHover: "#374151",
      colorPress: "#0f172a",
      colorFocus: "#0f172a",
      borderColor: "#d1d5db",
      shadowColor: "rgba(0,0,0,0.12)",
      // Custom semantic tokens
      secondaryText: "#575E6A", // WCAG AA compliant on #F2F2F7
      placeholderColor: "#8E8E93",

      // Legacy & Accents
      cardBackground: "rgba(255, 255, 255, 0.85)",
      listItemBackground: "rgba(255, 255, 255, 0.6)",
      accentGradientStart: "#6366f1",
      accentGradientEnd: "#8b5cf6",
      accentColor: "#6366f1",

      // Glassmorphism
      glassBackground: "rgba(255, 255, 255, 0.5)",
      glassBorder: "rgba(0, 0, 0, 0.1)",
      glassShadow: "rgba(0, 0, 0, 0.08)",
      glassWhite: "rgba(255, 255, 255, 0.95)",
      glassHighlight: "rgba(255, 255, 255, 0.85)", // For elevated elements

      // Additional color tokens
      deepBlue: "#0b0f19",
      electricBlue: "#2da6fa",
      // Health Colors
      healthGood: "#22c55e",
      healthWarning: "#f59e0b",
      healthCritical: "#ef4444",

      // Form-specific tokens (WCAG AA compliant)
      formInputBackground: "rgba(0, 0, 0, 0.03)",
      formInputBorder: "rgba(0, 0, 0, 0.1)",
      formInputPlaceholder: "#8E8E93",
      formLabel: "#0f172a",
    },
    dark: {
      ...defaultConfig.themes.dark,
      background: "#050505", // Deep Black for glass glow effect
      color: "#ffffff",
      placeholderColor: "#636366",

      // Glassmorphism - Enhanced visibility
      glassBackground: "rgba(255, 255, 255, 0.08)",
      glassBorder: "rgba(255, 255, 255, 0.15)",
      glassShadow: "rgba(0, 0, 0, 0.5)",
      glassWhite: "rgba(255, 255, 255, 0.12)",
      glassHighlight: "rgba(255, 255, 255, 0.18)", // For elevated elements

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

      // Form-specific tokens (WCAG AA compliant)
      formInputBackground: "rgba(255, 255, 255, 0.05)",
      formInputBorder: "rgba(255, 255, 255, 0.15)",
      formInputPlaceholder: "#636366",
      formLabel: "#ffffff",
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
