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
    forceDark: {
      true: {
        // Dark themed input for auth pages with dark backgrounds
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.2)",
        color: "white",
        focusStyle: {
          borderColor: "$electricBlue",
          borderWidth: 1,
        },
      },
    },
  } as const,
});

type TamaguiInputProps = React.ComponentProps<typeof BaseInput>;

interface InputProps extends TamaguiInputProps {
  error?: boolean;
  errorMessage?: string;
  /** Force dark styling regardless of theme (for pages with dark backgrounds) */
  forceDark?: boolean;
}

/**
 * Custom Input component with error state styling.
 * Uses Tamagui Input v1.143.0+ which has proper onChangeText typing for web.
 */
export const Input = ({ error, errorMessage, forceDark, ...props }: InputProps) => {
  return (
    <YStack>
      <BaseInput hasError={error} forceDark={forceDark} {...props} />
      {error && errorMessage && (
        <Text color="#ef4444" fontSize={12} marginTop={4} marginLeft={4} fontFamily="$body">
          {errorMessage}
        </Text>
      )}
    </YStack>
  );
};
