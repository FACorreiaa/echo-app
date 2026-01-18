import { Eye, EyeOff } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { NativeSyntheticEvent, Pressable, StyleSheet, TextInputFocusEventData } from "react-native";
import { InputProps, Input as TamaguiInput, Text, XStack, YStack } from "tamagui";

/**
 * HUDPasswordInput - Tactical password input with show/hide toggle
 * Matches HUD design system with eye icon for password visibility
 */
interface HUDPasswordInputProps extends Omit<InputProps, "ref" | "secureTextEntry"> {
  label?: string;
  error?: boolean;
  helperText?: string;
}

export const HUDPasswordInput: React.FC<HUDPasswordInputProps> = ({
  label,
  error,
  helperText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

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

      <XStack position="relative" alignItems="center">
        <TamaguiInput
          flex={1}
          backgroundColor="$formInputBackground"
          borderWidth={1}
          borderColor={error ? "$hudWarning" : isFocused ? "$hudActive" : "$hudBorder"}
          borderRadius={4}
          color="$color"
          paddingVertical="$3"
          paddingHorizontal="$3"
          paddingRight={48}
          placeholderTextColor="$formInputPlaceholder"
          style={{ fontSize: 14 }}
          secureTextEntry={!showPassword}
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

        <Pressable onPress={toggleVisibility} style={styles.toggleButton}>
          {showPassword ? (
            <EyeOff size={20} color="$colorHover" />
          ) : (
            <Eye size={20} color="$colorHover" />
          )}
        </Pressable>
      </XStack>

      {error && helperText && (
        <Text color="$hudWarning" fontSize={11} marginTop="$2">
          {helperText}
        </Text>
      )}
    </YStack>
  );
};

const styles = StyleSheet.create({
  toggleButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
});
