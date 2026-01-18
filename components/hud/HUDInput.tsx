import React, { useState } from "react";
import { NativeSyntheticEvent, Platform, TextInputFocusEventData } from "react-native";
import { InputProps, Input as TamaguiInput, Text, YStack } from "tamagui";

/**
 * HUDInput - Tactical form input with focus glow effect
 * Includes web-specific handling for email and other keyboard types
 */
interface HUDInputProps extends Omit<InputProps, "ref"> {
  label?: string;
  error?: boolean;
  helperText?: string;
}

// Map React Native keyboardType to web inputMode
const getWebInputMode = (keyboardType?: string): string | undefined => {
  switch (keyboardType) {
    case "email-address":
      return "email";
    case "numeric":
    case "number-pad":
      return "numeric";
    case "decimal-pad":
      return "decimal";
    case "phone-pad":
      return "tel";
    case "url":
      return "url";
    default:
      return undefined;
  }
};

export const HUDInput: React.FC<HUDInputProps> = ({ label, error, helperText, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  // Build web-specific props
  const webProps =
    Platform.OS === "web"
      ? {
          inputMode: getWebInputMode(props.keyboardType as string),
          // Ensure autocomplete works properly on web
          autoComplete: props.keyboardType === "email-address" ? "email" : undefined,
        }
      : {};

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
        {...webProps}
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
