/**
 * GlassInput - Theme-aware input component for auth forms
 * Uses Tamagui theme tokens for WCAG AA compliant contrast in both light and dark modes
 */

import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { Input, Label, styled, Text, useTheme, XStack, YStack } from "tamagui";

// Styled Input that uses theme tokens for proper contrast
const BaseGlassInput = styled(Input, {
  backgroundColor: "$formInputBackground",
  borderColor: "$formInputBorder",
  borderWidth: 1,
  borderRadius: 12,
  color: "$color",
  height: 50,
  paddingHorizontal: 16,
  placeholderTextColor: "$formInputPlaceholder",

  focusStyle: {
    borderColor: "$accentColor",
    borderWidth: 2,
    backgroundColor: "transparent",
  },

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

export type GlassInputProps = React.ComponentProps<typeof BaseGlassInput> & {
  error?: boolean;
  errorMessage?: string;
};

export const GlassInput = ({ error, errorMessage, ...props }: GlassInputProps) => {
  return (
    <YStack>
      <BaseGlassInput hasError={error} {...props} />
      {error && errorMessage && (
        <Text color="#ef4444" fontSize={12} marginTop={4} marginLeft={4} fontFamily="$body">
          {errorMessage}
        </Text>
      )}
    </YStack>
  );
};

// Form field wrapper with label
interface FormFieldProps extends GlassInputProps {
  label: string;
}

export const FormField = ({ label, ...props }: FormFieldProps) => (
  <YStack gap="$2">
    <Label fontSize={14} fontWeight="700" color="$formLabel">
      {label}
    </Label>
    <GlassInput {...props} />
  </YStack>
);

// Password input with visibility toggle
interface GlassPasswordInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  editable?: boolean;
}

export const GlassPasswordInput = ({
  value,
  onChangeText,
  placeholder,
  error,
  errorMessage,
  editable = true,
}: GlassPasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Use theme tokens for proper contrast
  const backgroundColor = error
    ? "rgba(239, 68, 68, 0.05)"
    : theme.formInputBackground?.val || "rgba(255, 255, 255, 0.05)";
  const borderColor = error ? "#ef4444" : theme.formInputBorder?.val || "rgba(255, 255, 255, 0.15)";
  const textColor = theme.color?.val || "#fff";
  const placeholderColor = theme.formInputPlaceholder?.val || "#636366";
  const iconColor = theme.color?.val || "#fff";

  return (
    <YStack>
      <XStack position="relative">
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor,
              borderColor,
              color: textColor,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          secureTextEntry={!showPassword}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={toggleVisibility} style={styles.toggleButton}>
          {showPassword ? (
            <EyeOff size={20} color={iconColor as any} />
          ) : (
            <Eye size={20} color={iconColor as any} />
          )}
        </Pressable>
      </XStack>
      {error && errorMessage && (
        <Text color="#ef4444" fontSize={12} marginTop={4} marginLeft={4} fontFamily="$body">
          {errorMessage}
        </Text>
      )}
    </YStack>
  );
};

// Password field wrapper with label
interface PasswordFieldProps extends GlassPasswordInputProps {
  label: string;
}

export const PasswordField = ({ label, ...props }: PasswordFieldProps) => (
  <YStack gap="$2">
    <Label fontSize={14} fontWeight="700" color="$formLabel">
      {label}
    </Label>
    <GlassPasswordInput {...props} />
  </YStack>
);

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 48,
    fontSize: 16,
    fontFamily: "Outfit_400Regular",
  },
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
