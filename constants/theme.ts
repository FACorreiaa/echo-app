/**
 * Echo Theme - Matching echolanding design system
 * Colors converted from oklch to hex for React Native compatibility
 */

import { Platform } from "react-native";

// Echo brand colors
const echoPrimary = "#3B9BD9"; // oklch(0.65 0.18 220) - cyan-blue
const echoAccent = "#12B886"; // oklch(0.55 0.2 170) - teal
const echoGlow = "rgba(59, 155, 217, 0.3)";

export const Colors = {
  // Shared brand colors
  brand: {
    primary: echoPrimary,
    accent: echoAccent,
    glow: echoGlow,
  },

  light: {
    // Base
    text: "#1B1D2A",
    background: "#FAFAFA",
    tint: echoPrimary,

    // UI Elements
    card: "#FFFFFF",
    cardForeground: "#1B1D2A",
    popover: "#FFFFFF",
    popoverForeground: "#1B1D2A",

    // Interactive
    primary: "#2B7BB9",
    primaryForeground: "#FAFAFA",
    secondary: "#F1F3F5",
    secondaryForeground: "#1B1D2A",
    muted: "#F1F3F5",
    mutedForeground: "#6B7280",
    accent: echoAccent,
    accentForeground: "#FAFAFA",
    destructive: "#DC2626",

    // Borders & Inputs
    border: "rgba(0, 0, 0, 0.1)",
    input: "rgba(0, 0, 0, 0.1)",
    ring: "#2B7BB9",

    // Navigation
    icon: "#6B7280",
    tabIconDefault: "#6B7280",
    tabIconSelected: echoPrimary,

    // Charts
    chart1: "#2B7BB9",
    chart2: "#12B886",
    chart3: "#FBBF24",
    chart4: "#A855F7",
    chart5: "#F97316",
  },

  dark: {
    // Base
    text: "#FAFAFA",
    background: "#1B1D2A",
    tint: "#FFFFFF",

    // UI Elements
    card: "#252836",
    cardForeground: "#FAFAFA",
    popover: "#252836",
    popoverForeground: "#FAFAFA",

    // Interactive
    primary: echoPrimary,
    primaryForeground: "#FAFAFA",
    secondary: "#3A3D4E",
    secondaryForeground: "#FAFAFA",
    muted: "#3A3D4E",
    mutedForeground: "#8B8D98",
    accent: echoAccent,
    accentForeground: "#FAFAFA",
    destructive: "#E05252",

    // Borders & Inputs
    border: "rgba(255, 255, 255, 0.1)",
    input: "rgba(255, 255, 255, 0.15)",
    ring: echoPrimary,

    // Navigation
    icon: "#8B8D98",
    tabIconDefault: "#8B8D98",
    tabIconSelected: "#FFFFFF",

    // Charts
    chart1: echoPrimary,
    chart2: echoAccent,
    chart3: "#FBBF24",
    chart4: "#A855F7",
    chart5: "#F97316",
  },
} as const;

// Type for color keys
export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing scale for consistent layouts
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

// Border radius scale
export const Radius = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  "2xl": 18,
  "3xl": 22,
  full: 9999,
} as const;
