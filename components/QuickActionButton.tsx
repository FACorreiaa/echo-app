import { Pressable } from "react-native";
import { GetProps, styled, Text, YStack } from "tamagui";

const ButtonFrame = styled(YStack, {
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  minWidth: 70,
});

const IconCircle = styled(YStack, {
  width: 56,
  height: 56,
  borderRadius: 28,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "$listItemBackground",
  borderWidth: 1,
  borderColor: "$borderColor",
  pressStyle: {
    opacity: 0.7,
    scale: 0.95,
  },
});

const ButtonLabel = styled(Text, {
  color: "$color",
  fontSize: 12,
  fontFamily: "Outfit_500Medium",
  textAlign: "center",
});

export type QuickActionButtonProps = GetProps<typeof ButtonFrame> & {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
};

export const QuickActionButton = ({ icon, label, onPress, ...props }: QuickActionButtonProps) => {
  return (
    <Pressable onPress={onPress}>
      <ButtonFrame {...props}>
        <IconCircle>{icon}</IconCircle>
        <ButtonLabel>{label}</ButtonLabel>
      </ButtonFrame>
    </Pressable>
  );
};
