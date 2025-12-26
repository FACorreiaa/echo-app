import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";
import { GetProps, styled, YStack } from "tamagui";
import { useTheme } from "@/contexts/ThemeContext";

// Create a configured YStack for the card container
const CardFrame = styled(YStack, {
  borderRadius: 24,
  borderWidth: 1,
  borderColor: "$glassBorder", // Uses our custom token
  padding: 24,
  overflow: "hidden",
  backgroundColor: "$glassWhite",
});

export type GlassyCardProps = GetProps<typeof CardFrame> & {
  intensity?: number;
};

export const GlassyCard = (props: GlassyCardProps) => {
  const { isDark } = useTheme();

  // We wrap the content in a BlurView for the native glass effect
  return (
    <CardFrame {...props} position="relative">
      <BlurView
        intensity={props.intensity ?? 20}
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
