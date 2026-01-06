import { Eye, EyeOff } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput } from "react-native";
import { Text, XStack, YStack, useTheme } from "tamagui";

interface PasswordInputProps {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  error?: boolean;
  errorMessage?: string;
  editable?: boolean;
}

export const PasswordInput = ({
  value,
  onChangeText,
  placeholder,
  error,
  errorMessage,
  editable = true,
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get theme colors for styling
  const backgroundColor = error ? "rgba(239, 68, 68, 0.05)" : theme.background?.val || "#1a1a1a";
  const borderColor = error ? "#ef4444" : theme.borderColor?.val || "#333";
  const textColor = theme.color?.val || "#fff";
  const placeholderColor = theme.colorHover?.val || "#888";

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
            <EyeOff size={20} color="$colorHover" />
          ) : (
            <Eye size={20} color="$colorHover" />
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

const styles = StyleSheet.create({
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 48, // Space for eye icon
    fontSize: 16,
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
