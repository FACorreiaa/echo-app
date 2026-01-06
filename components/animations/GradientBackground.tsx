import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { useTheme, YStack } from "tamagui";

export const GradientBackground = ({ children }: { children?: React.ReactNode }) => {
  const theme = useTheme();
  // We check if the background color value implies dark mode (or use a prop/context if cleaner)
  // But checking the value of the 'background' token is a safe way to know the current theme's intent if strict checks fail.
  // Actually, simpler: useTheme returns the current theme tokens.
  // We can just define the colors based on whether we are in light or dark mode.
  // Ideally, we'd pass 'isDark' prop, but we can infer or just use token values.

  // Let's rely on the background token color. If it's dark (starts with #0 or similar), we use dark gradients.
  // A more robust way is to check the theme name if available, or just toggle colors.

  // Actually, I can just use the theme tokens directly if I map them to gradient colors in config,
  // but LinearGradient needs raw strings.

  // For now, let's assume we want a light gradient if background is light (#ffffff)
  const isLight = theme.background.val === "#ffffff" || theme.background.val === "#f2f2f2";

  return (
    <YStack flex={1} backgroundColor="$background">
      {isLight ? (
        // Light Mode Gradient: Clean White/Slate
        <LinearGradient
          colors={["#ffffff", "#f8f9fa"]} // Subtle top-down fade
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      ) : (
        // Dark Mode Gradient: Deep Blue
        <LinearGradient
          colors={["#1a1f35", "#0b0f19"]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      {/* Accents - Adjusted for visibility */}
      <LinearGradient
        colors={
          isLight
            ? ["rgba(45, 166, 250, 0.05)", "transparent"]
            : ["rgba(45, 166, 250, 0.15)", "transparent"]
        }
        style={[StyleSheet.absoluteFill, { width: "100%", height: "60%" }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <LinearGradient
        colors={
          isLight
            ? ["transparent", "rgba(120, 50, 255, 0.03)"]
            : ["transparent", "rgba(120, 50, 255, 0.1)"]
        }
        style={[StyleSheet.absoluteFill, { top: "40%" }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {children}
    </YStack>
  );
};
