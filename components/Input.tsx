import type { NativeSyntheticEvent, TextInputChangeEventData } from "react-native";
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

type TamaguiInputProps = React.ComponentProps<typeof BaseInput>;

interface InputProps extends Omit<TamaguiInputProps, "onChangeText"> {
  error?: boolean;
  errorMessage?: string;
  /**
   * Properly typed onChangeText for React Native + Tamagui compatibility
   */
  onChangeText?: (text: string) => void;
}

export const Input = ({ error, errorMessage, onChangeText, ...props }: InputProps) => {
  // Handle the Tamagui/RN event type mismatch
  const handleChange = onChangeText
    ? (e: NativeSyntheticEvent<TextInputChangeEventData> | string) => {
        if (typeof e === "string") {
          onChangeText(e);
        } else {
          onChangeText(e.nativeEvent.text);
        }
      }
    : undefined;

  return (
    <YStack>
      <BaseInput
        hasError={error}
        onChangeText={handleChange as TamaguiInputProps["onChangeText"]}
        {...props}
      />
      {error && errorMessage && (
        <Text color="#ef4444" fontSize={12} marginTop={4} marginLeft={4} fontFamily="$body">
          {errorMessage}
        </Text>
      )}
    </YStack>
  );
};
