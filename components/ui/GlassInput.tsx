/**
 * GlassInput - Theme-aware input component for auth forms
 * Uses Tamagui theme tokens for WCAG AA compliant contrast in both light and dark modes
 * Supports forceDark prop for consistent styling on dark backgrounds
 */

import { useTheme as useTamaguiTheme } from "@/contexts/ThemeContext";
import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { Input, Label, styled, Text, XStack, YStack } from "tamagui";

// Dark mode color constants
const DARK_COLORS = {
  background: "rgba(255, 255, 255, 0.08)",
  border: "rgba(255, 255, 255, 0.15)",
  text: "#ffffff",
  placeholder: "rgba(255, 255, 255, 0.5)",
  label: "rgba(255, 255, 255, 0.9)",
};

// Light mode color constants
const LIGHT_COLORS = {
  background: "rgba(0, 0, 0, 0.04)",
  border: "rgba(0, 0, 0, 0.12)",
  text: "#1a1a1a",
  placeholder: "rgba(0, 0, 0, 0.4)",
  label: "#1a1a1a",
};

// Styled Input that uses theme tokens for proper contrast
const BaseGlassInput = styled(Input, {
  borderWidth: 1,
  borderRadius: 12,
  height: 50,
  paddingHorizontal: 16,

  focusStyle: {
    borderColor: "$accentColor",
    borderWidth: 2,
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
  /** Force dark styling regardless of theme */
  forceDark?: boolean;
};

export const GlassInput = ({ error, errorMessage, forceDark, ...props }: GlassInputProps) => {
  const { isDark } = useTamaguiTheme();
  const useDarkStyle = isDark || forceDark;
  const colors = useDarkStyle ? DARK_COLORS : LIGHT_COLORS;

  return (
    <YStack>
      <BaseGlassInput
        hasError={error}
        backgroundColor={colors.background as any}
        borderColor={(error ? "#ef4444" : colors.border) as any}
        color={colors.text as any}
        placeholderTextColor={colors.placeholder as any}
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

// Form field wrapper with label
interface FormFieldProps extends GlassInputProps {
  label: string;
}

export const FormField = ({ label, forceDark, ...props }: FormFieldProps) => {
  const { isDark } = useTamaguiTheme();
  const useDarkStyle = isDark || forceDark;
  const colors = useDarkStyle ? DARK_COLORS : LIGHT_COLORS;

  return (
    <YStack gap="$2">
      <Label fontSize={14} fontWeight="700" color={colors.label as any}>
        {label}
      </Label>
      <GlassInput forceDark={forceDark} {...props} />
    </YStack>
  );
};

// Password input with visibility toggle
interface GlassPasswordInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  editable?: boolean;
  /** Force dark styling regardless of theme */
  forceDark?: boolean;
}

export const GlassPasswordInput = ({
  value,
  onChangeText,
  placeholder,
  error,
  errorMessage,
  editable = true,
  forceDark,
}: GlassPasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { isDark } = useTamaguiTheme();
  const useDarkStyle = isDark || forceDark;
  const colors = useDarkStyle ? DARK_COLORS : LIGHT_COLORS;

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  const backgroundColor = error ? "rgba(239, 68, 68, 0.05)" : colors.background;
  const borderColor = error ? "#ef4444" : colors.border;

  return (
    <YStack>
      <XStack position="relative">
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor,
              borderColor,
              color: colors.text,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={!showPassword}
          editable={editable}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable onPress={toggleVisibility} style={styles.toggleButton}>
          {showPassword ? (
            <EyeOff size={20} color={colors.text as any} />
          ) : (
            <Eye size={20} color={colors.text as any} />
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

export const PasswordField = ({ label, forceDark, ...props }: PasswordFieldProps) => {
  const { isDark } = useTamaguiTheme();
  const useDarkStyle = isDark || forceDark;
  const colors = useDarkStyle ? DARK_COLORS : LIGHT_COLORS;

  return (
    <YStack gap="$2">
      <Label fontSize={14} fontWeight="700" color={colors.label as any}>
        {label}
      </Label>
      <GlassPasswordInput forceDark={forceDark} {...props} />
    </YStack>
  );
};

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
