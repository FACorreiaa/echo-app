import { styled, Input as TamaguiInput, Text, YStack } from "tamagui";

const BaseInput = styled(TamaguiInput, {
  size: "$4",
  borderWidth: 1,
  borderColor: "$borderColor",
  backgroundColor: "$background",
  color: "$color",
  borderRadius: 12,
  paddingHorizontal: 16,
  focusStyle: {
    borderColor: "$electricBlue",
    borderWidth: 1,
  },
  placeholderTextColor: "$colorHover",
  fontFamily: "Outfit_400Regular",

  variants: {
    hasError: {
      true: {
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.05)",
        focusStyle: {
          borderColor: "#ef4444",
          borderWidth: 2,
        },
      },
    },
  } as const,
});

interface InputProps extends React.ComponentProps<typeof BaseInput> {
  error?: boolean;
  errorMessage?: string;
}

export const Input = ({ error, errorMessage, ...props }: InputProps) => {
  return (
    <YStack>
      <BaseInput hasError={error} {...props} />
      {error && errorMessage && (
        <Text
          color="#ef4444"
          fontSize={12}
          marginTop={4}
          marginLeft={4}
          fontFamily="Outfit_400Regular"
        >
          {errorMessage}
        </Text>
      )}
    </YStack>
  );
};
