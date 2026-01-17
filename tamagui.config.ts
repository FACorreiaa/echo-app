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
      // Light mode: Soft futuristic background
      background: "#f5f7fa",
      backgroundHover: "#e8ecf4",
      backgroundPress: "#dce2ed",
      backgroundFocus: "#f5f7fa",
      color: "#0f172a",
      colorHover: "#1e293b",
      colorPress: "#0f172a",
      colorFocus: "#0f172a",
      borderColor: "rgba(100, 116, 139, 0.2)",
      shadowColor: "rgba(0,0,0,0.1)",

      // Semantic tokens
      secondaryText: "#475569",
      placeholderColor: "#94a3b8",

      // Futuristic accent colors
      cardBackground: "rgba(255, 255, 255, 0.75)",
      listItemBackground: "rgba(255, 255, 255, 0.65)",
      accentGradientStart: "#1e88e5", // Electric blue
      accentGradientEnd: "#8b5cf6", // Purple
      accentColor: "#1e88e5",

      // Holographic glassmorphism
      glassBackground: "rgba(255, 255, 255, 0.7)",
      glassBorder: "rgba(30, 136, 229, 0.15)", // Cyan tint
      glassShadow: "rgba(30, 136, 229, 0.08)",
      glassWhite: "rgba(255, 255, 255, 0.85)",
      glassHighlight: "rgba(255, 255, 255, 0.95)",

      // Futuristic accent tokens
      cyan: "#00a3cc",
      purple: "#8b5cf6",
      electricBlue: "#1e88e5",
      neonCyan: "#00d9ff",
      neonPurple: "#b47aff",

      // Glow effects
      glowCyan: "rgba(0, 163, 204, 0.3)",
      glowPurple: "rgba(139, 92, 246, 0.3)",
      glowBlue: "rgba(30, 136, 229, 0.3)",

      // Health Colors
      healthGood: "#10b981",
      healthWarning: "#f59e0b",
      healthCritical: "#ef4444",

      // Form tokens
      formInputBackground: "rgba(255, 255, 255, 0.6)",
      formInputBorder: "rgba(30, 136, 229, 0.2)",
      formInputPlaceholder: "#94a3b8",
      formLabel: "#0f172a",

      // Depth layers for holographic effect
      layer1: "rgba(255, 255, 255, 0.9)",
      layer2: "rgba(255, 255, 255, 0.75)",
      layer3: "rgba(255, 255, 255, 0.6)",
    },
    dark: {
      ...defaultConfig.themes.dark,
      // Dark mode: Deep navy/charcoal with futuristic accents
      background: "#0a0e27",
      backgroundHover: "#0f1419",
      backgroundPress: "#050811",
      backgroundFocus: "#0a0e27",
      color: "#ffffff",
      colorHover: "#e2e8f0",
      colorPress: "#ffffff",
      colorFocus: "#ffffff",
      borderColor: "rgba(0, 217, 255, 0.15)",
      shadowColor: "rgba(0, 217, 255, 0.2)",
      placeholderColor: "#64748b",

      // Holographic glassmorphism with cyan/purple glow
      glassBackground: "rgba(255, 255, 255, 0.05)",
      glassBorder: "rgba(0, 217, 255, 0.2)",
      glassShadow: "rgba(0, 217, 255, 0.15)",
      glassWhite: "rgba(255, 255, 255, 0.08)",
      glassHighlight: "rgba(255, 255, 255, 0.12)",

      cardBackground: "rgba(255, 255, 255, 0.06)",
      listItemBackground: "rgba(255, 255, 255, 0.04)",
      accentGradientStart: "#00d9ff", // Neon cyan
      accentGradientEnd: "#b47aff", // Neon purple
      accentColor: "#00d9ff",
      secondaryText: "#94a3b8",

      // Futuristic neon accent tokens
      cyan: "#00d9ff",
      purple: "#b47aff",
      electricBlue: "#2da6fa",
      neonCyan: "#00ffff",
      neonPurple: "#d896ff",

      // Glow effects for holographic depth
      glowCyan: "rgba(0, 217, 255, 0.4)",
      glowPurple: "rgba(180, 122, 255, 0.4)",
      glowBlue: "rgba(45, 166, 250, 0.4)",

      // Health Colors with neon glow
      healthGood: "#10b981",
      healthWarning: "#fbbf24",
      healthCritical: "#f87171",

      // Form tokens with futuristic glow
      formInputBackground: "rgba(255, 255, 255, 0.04)",
      formInputBorder: "rgba(0, 217, 255, 0.2)",
      formInputPlaceholder: "#64748b",
      formLabel: "#e2e8f0",

      // Depth layers for holographic effect
      layer1: "rgba(255, 255, 255, 0.12)",
      layer2: "rgba(255, 255, 255, 0.08)",
      layer3: "rgba(255, 255, 255, 0.05)",
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
