import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { GetProps, styled, YStack } from "tamagui";
import { useTheme } from "@/contexts/ThemeContext";

// Create a configured YStack for the card container
const CardFrame = styled(YStack, {
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "$glassBorder",
  padding: 24,
  overflow: "hidden",
  // In light mode, we want a slight wash to ensure contrast against gradient.
  // In dark mode, the glassWhite token handles it.
  backgroundColor: "$glassWhite",
});

export type GlassyCardProps = GetProps<typeof CardFrame> & {
  intensity?: number;
};

export const GlassyCard = (props: GlassyCardProps) => {
  const { isDark } = useTheme();

  return (
    <CardFrame
      {...props}
      position="relative"
      backgroundColor={isDark ? "$glassWhite" : "rgba(255,255,255,0.7)"}
    >
      <BlurView
        intensity={props.intensity ?? (isDark ? 30 : 50)} // Higher intensity in light mode for better text bg
        style={StyleSheet.absoluteFill}
        tint={isDark ? "dark" : "light"}
      />
      {/* Content sits on top of the blur */}
      <YStack zIndex={1} space>
        {props.children}
      </YStack>
    </CardFrame>
  );
};
