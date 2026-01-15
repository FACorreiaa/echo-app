import { useTheme } from "@/contexts/ThemeContext";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { GetProps, styled, YStack } from "tamagui";

// Create a configured YStack for the card container
const CardFrame = styled(YStack, {
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "$glassBorder",
  padding: 24,
  overflow: "hidden",
  backgroundColor: "$glassWhite",
});

export type GlassyCardProps = GetProps<typeof CardFrame> & {
  intensity?: number;
  /** Force dark styling regardless of theme (for pages with dark backgrounds) */
  forceDark?: boolean;
};

export const GlassyCard = (props: GlassyCardProps) => {
  const { isDark } = useTheme();

  // Use dark styling if either system is dark mode OR forceDark is true
  const useDarkStyle = isDark || props.forceDark;

  return (
    <CardFrame
      {...props}
      position="relative"
      backgroundColor={useDarkStyle ? "$glassWhite" : "rgba(255,255,255,0.85)"}
      borderColor={useDarkStyle ? "$glassBorder" : "rgba(0,0,0,0.1)"}
    >
      <BlurView
        intensity={props.intensity ?? (useDarkStyle ? 30 : 50)}
        style={StyleSheet.absoluteFill}
        tint={useDarkStyle ? "dark" : "light"}
      />
      {/* Content sits on top of the blur */}
      <YStack zIndex={1} space>
        {props.children}
      </YStack>
    </CardFrame>
  );
};
