import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { Button, styled, Text } from "tamagui";

const BaseButton = styled(Button, {
  height: 54,
  borderRadius: 100, // Pill shape
  borderWidth: 0,
  overflow: "hidden",
  pressStyle: { opacity: 0.9, scale: 0.98 },
  animation: "bouncy",
});

const ButtonText = styled(Text, {
  color: "white",
  fontWeight: "600",
  fontSize: 17,
  fontFamily: "Outfit_500Medium",
});

export const GlassyButton = ({
  children,
  variant = "primary",
  ...props
}: {
  children: string;
  variant?: "primary" | "outline";
} & React.ComponentProps<typeof BaseButton>) => {
  if (variant === "primary") {
    return (
      <BaseButton {...props} backgroundColor="transparent">
        <LinearGradient
          colors={["#2da6fa", "#355dfa"]} // Revolut-ish blue gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <ButtonText>{children}</ButtonText>
      </BaseButton>
    );
  }

  // Outline / Ghost variant
  return (
    <BaseButton
      {...props}
      backgroundColor="rgba(255,255,255,0.05)"
      borderWidth={1}
      borderColor="rgba(255,255,255,0.2)"
    >
      <ButtonText>{children}</ButtonText>
    </BaseButton>
  );
};
