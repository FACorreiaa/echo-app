import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { Button, styled, Text, useTheme } from "tamagui";

const BaseButton = styled(Button, {
  height: 54,
  borderRadius: 100, // Pill shape
  borderWidth: 0,
  overflow: "hidden",
  pressStyle: { opacity: 0.9, scale: 0.98 },
  animation: "bouncy",
});

const ButtonText = styled(Text, {
  fontWeight: "600",
  fontSize: 17,
  fontFamily: "$body",
  // Ensure text is always visible
  zIndex: 1,
});

type BaseButtonProps = Omit<React.ComponentProps<typeof BaseButton>, "variant">;

export const GlassyButton = ({
  children,
  variant = "primary",
  ...props
}: {
  children: React.ReactNode;
  variant?: "primary" | "outline";
} & BaseButtonProps) => {
  const theme = useTheme();
  const isDark = theme.background?.val === "#0b0f19";

  if (variant === "primary") {
    return (
      <BaseButton {...props} backgroundColor="transparent">
        <LinearGradient
          colors={["#2da6fa", "#355dfa"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <ButtonText color="white">{children}</ButtonText>
      </BaseButton>
    );
  }

  // Outline / Ghost variant - adjust text color based on theme
  const textColor = isDark ? "white" : "#0f172a";
  const borderColor = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)";
  const bgColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";

  return (
    <BaseButton {...props} backgroundColor={bgColor} borderWidth={1} borderColor={borderColor}>
      <ButtonText color={textColor}>{children}</ButtonText>
    </BaseButton>
  );
};
