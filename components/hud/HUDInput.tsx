import React, { useState } from "react";
import { Input as TamaguiInput, YStack, Text, InputProps } from "tamagui";
import { NativeSyntheticEvent, TextInputFocusEventData } from "react-native";

/**
 * HUDInput - Tactical form input with focus glow effect
 */
interface HUDInputProps extends Omit<InputProps, "ref"> {
  label?: string;
  error?: boolean;
  helperText?: string;
}

export const HUDInput: React.FC<HUDInputProps> = ({ label, error, helperText, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <YStack width="100%">
      {label && (
        <Text
          color="$formLabel"
          marginBottom="$2"
          fontWeight="600"
          letterSpacing={0.5}
          style={{ fontSize: 12 }}
        >
          {label.toUpperCase()}
        </Text>
      )}

      <TamaguiInput
        backgroundColor="$formInputBackground"
        borderWidth={1}
        borderColor={error ? "$hudWarning" : isFocused ? "$hudActive" : "$hudBorder"}
        borderRadius={4}
        color="$color"
        paddingVertical="$3"
        paddingHorizontal="$3"
        placeholderTextColor="$formInputPlaceholder"
        style={{ fontSize: 14 }}
        // Glow effect on focus
        shadowColor={isFocused ? "$hudActive" : "transparent"}
        shadowOffset={{ width: 0, height: 0 }}
        shadowOpacity={isFocused ? 0.3 : 0}
        shadowRadius={isFocused ? 10 : 0}
        onFocus={(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
          setIsFocused(true);
          props.onFocus?.(e as any);
        }}
        onBlur={(e: NativeSyntheticEvent<TextInputFocusEventData>) => {
          setIsFocused(false);
          props.onBlur?.(e as any);
        }}
        {...props}
      />

      {error && helperText && (
        <Text color="$hudWarning" fontSize={11} marginTop="$2">
          {helperText}
        </Text>
      )}
    </YStack>
  );
};
