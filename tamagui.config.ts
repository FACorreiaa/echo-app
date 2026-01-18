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
      // Light mode: Clean, bright, minimal aesthetic
      background: "#f8fafc",
      backgroundHover: "#f1f5f9",
      backgroundPress: "#e2e8f0",
      backgroundFocus: "#f8fafc",
      color: "#0f172a",
      colorHover: "#1e293b",
      colorPress: "#0f172a",
      colorFocus: "#0f172a",
      borderColor: "rgba(15, 23, 42, 0.1)",
      shadowColor: "rgba(0, 0, 0, 0.08)",

      // Semantic tokens
      secondaryText: "#64748b",
      placeholderColor: "#94a3b8",

      // Card backgrounds for light mode - clean, subtle shadows
      cardBackground: "#ffffff",
      listItemBackground: "#ffffff",
      accentGradientStart: "#0284c7", // Sky blue
      accentGradientEnd: "#7c3aed", // Violet
      accentColor: "#0284c7",

      // Light glassmorphism - subtle, clean
      glassBackground: "rgba(255, 255, 255, 0.9)",
      glassBorder: "rgba(15, 23, 42, 0.08)",
      glassShadow: "rgba(0, 0, 0, 0.06)",
      glassWhite: "#ffffff",
      glassHighlight: "#ffffff",

      // Accent tokens
      cyan: "#0284c7",
      purple: "#7c3aed",
      electricBlue: "#0284c7",
      neonCyan: "#0ea5e9",
      neonPurple: "#8b5cf6",

      // Glow effects - subtle in light mode
      glowCyan: "rgba(2, 132, 199, 0.15)",
      glowPurple: "rgba(124, 58, 237, 0.15)",
      glowBlue: "rgba(2, 132, 199, 0.15)",

      // Health Colors
      healthGood: "#059669",
      healthWarning: "#d97706",
      healthCritical: "#dc2626",

      // Form tokens - clean inputs
      formInputBackground: "#ffffff",
      formInputBorder: "rgba(15, 23, 42, 0.12)",
      formInputPlaceholder: "#94a3b8",
      formLabel: "#0f172a",

      // Depth layers
      layer1: "#ffffff",
      layer2: "#f8fafc",
      layer3: "#f1f5f9",

      // Light mode HUD/Nav tokens - inverted for light mode
      hudFoundation: "#f8fafc",
      hudGrid: "rgba(2, 132, 199, 0.05)",
      hudActive: "#0284c7",
      hudWarning: "#dc2626",
      hudDepth: "rgba(255, 255, 255, 0.95)",
      hudBorder: "rgba(15, 23, 42, 0.1)",
      hudGlow: "#0284c7",
    },
    dark: {
      ...defaultConfig.themes.dark,
      // Dark mode: Pure Obsidian with Neon accents - TACTICAL HUD
      background: "#020203",
      backgroundHover: "#0a0a0f",
      backgroundPress: "#000000",
      backgroundFocus: "#020203",
      color: "#ffffff",
      colorHover: "#e2e8f0",
      colorPress: "#ffffff",
      colorFocus: "#ffffff",
      borderColor: "rgba(45, 166, 250, 0.2)",
      shadowColor: "rgba(45, 166, 250, 0.2)",
      placeholderColor: "#636366",

      // HUD Tactical Cards - Solid enough for contrast, thin enough for depth
      glassBackground: "rgba(10, 10, 15, 0.9)",
      glassBorder: "rgba(45, 166, 250, 0.2)",
      glassShadow: "rgba(45, 166, 250, 0.15)",
      glassWhite: "rgba(255, 255, 255, 0.08)",
      glassHighlight: "rgba(255, 255, 255, 0.12)",

      cardBackground: "rgba(10, 10, 15, 0.9)",
      listItemBackground: "rgba(10, 10, 15, 0.75)",
      accentGradientStart: "#2DA6FA", // Tactical Cyan
      accentGradientEnd: "#2DA6FA", // Keep uniform for OS feel
      accentColor: "#2DA6FA",
      secondaryText: "#94a3b8",

      // Tactical OS accent tokens
      cyan: "#2DA6FA",
      purple: "#b47aff",
      electricBlue: "#2DA6FA",
      neonCyan: "#2DA6FA",
      neonPurple: "#d896ff",

      // Tactical glow effects
      glowCyan: "rgba(45, 166, 250, 0.3)",
      glowPurple: "rgba(180, 122, 255, 0.3)",
      glowBlue: "rgba(45, 166, 250, 0.3)",

      // System status colors
      healthGood: "#10b981",
      healthWarning: "#fbbf24",
      healthCritical: "#FF2D55",

      // Form tokens with tactical glow
      formInputBackground: "rgba(10, 10, 15, 0.9)",
      formInputBorder: "rgba(45, 166, 250, 0.2)",
      formInputPlaceholder: "#636366",
      formLabel: "#e2e8f0",

      // HUD depth layers
      layer1: "rgba(10, 10, 15, 0.95)",
      layer2: "rgba(10, 10, 15, 0.85)",
      layer3: "rgba(10, 10, 15, 0.75)",

      // Tactical HUD OS tokens
      hudFoundation: "#020203",
      hudGrid: "rgba(45, 166, 250, 0.05)",
      hudActive: "#2DA6FA",
      hudWarning: "#FF2D55",
      hudDepth: "rgba(10, 10, 15, 0.9)",
      hudBorder: "rgba(45, 166, 250, 0.2)",
      hudGlow: "#2DA6FA",
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
