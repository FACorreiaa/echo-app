/**
 * AliveInitialScreen - Premium auth screen with animated background
 * Supports both login and register modes with keyboard-synchronized morphing
 */

import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import { useCallback, useEffect, useState } from "react";
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Input, Text, XStack, YStack } from "tamagui";

import { GlassyCard, PasswordInput } from "@/components";
import { useLogin, useRegister } from "@/lib/hooks/use-auth";
import { getFriendlyErrorMessage } from "@/lib/utils/error-messages";

import { AliveBackground } from "./AliveBackground";
import { MorphingHero } from "./MorphingHero";

interface AliveInitialScreenProps {
  mode?: "login" | "register";
}

export function AliveInitialScreen({ mode = "login" }: AliveInitialScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Track keyboard visibility
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleEmailChange = useCallback(
    (text: string) => {
      setEmail(text);
      if (error) setError("");

      // Haptic on valid email format
      if (text.includes("@") && text.includes(".") && text.length > 5) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    },
    [error],
  );

  const handlePasswordChange = useCallback(
    (text: string) => {
      setPassword(text);
      if (error) setError("");
    },
    [error],
  );

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (mode === "register") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const mutation = mode === "login" ? loginMutation : registerMutation;
    const payload =
      mode === "login"
        ? { email: email.trim(), password }
        : { email: email.trim(), password, username: username.trim() || undefined };

    mutation.mutate(payload, {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      },
      onError: (err) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(getFriendlyErrorMessage(err));
      },
    });
  };

  const isLoading = mode === "login" ? loginMutation.isPending : registerMutation.isPending;

  return (
    <YStack flex={1} backgroundColor="$background">
      {/* Animated Background */}
      <AliveBackground isKeyboardVisible={isKeyboardVisible} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <YStack
            flex={1}
            paddingTop={insets.top + 40}
            paddingBottom={insets.bottom + 20}
            paddingHorizontal="$5"
            justifyContent="space-between"
            minHeight="100%"
          >
            {/* Hero Section */}
            <YStack alignItems="center" marginBottom="$4">
              <MorphingHero
                isKeyboardVisible={isKeyboardVisible}
                subtitle={mode === "login" ? "Welcome back" : "Start your journey"}
              />
            </YStack>

            {/* Form Section */}
            <MotiView
              animate={{
                translateY: isKeyboardVisible ? -10 : 0,
              }}
              transition={{ type: "spring", damping: 15 }}
            >
              <GlassyCard>
                <YStack gap="$3" padding="$1">
                  {error ? (
                    <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                      <YStack
                        backgroundColor="rgba(239, 68, 68, 0.1)"
                        borderRadius="$3"
                        padding="$3"
                      >
                        <Text color="#ef4444" textAlign="center" fontSize="$3">
                          {error}
                        </Text>
                      </YStack>
                    </MotiView>
                  ) : null}

                  {/* Email */}
                  <YStack gap="$1">
                    <Text color="$color" fontSize="$2" marginLeft="$1">
                      Email
                    </Text>
                    <Input
                      size="$4"
                      borderRadius="$4"
                      color="$color"
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={handleEmailChange}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      editable={!isLoading}
                    />
                  </YStack>

                  {/* Username (register only) */}
                  {mode === "register" && (
                    <YStack gap="$1">
                      <Text color="$color" fontSize="$2" marginLeft="$1">
                        Username (optional)
                      </Text>
                      <Input
                        size="$4"
                        borderRadius="$4"
                        color="$color"
                        placeholder="johndoe"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        editable={!isLoading}
                      />
                    </YStack>
                  )}

                  {/* Password */}
                  <YStack gap="$1">
                    <Text color="$color" fontSize="$2" marginLeft="$1">
                      Password
                    </Text>
                    <PasswordInput
                      placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"}
                      value={password}
                      onChangeText={handlePasswordChange}
                      editable={!isLoading}
                    />
                  </YStack>

                  {/* Confirm Password (register only) */}
                  {mode === "register" && (
                    <YStack gap="$1">
                      <Text color="$color" fontSize="$2" marginLeft="$1">
                        Confirm Password
                      </Text>
                      <PasswordInput
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={!isLoading}
                      />
                    </YStack>
                  )}

                  <Button
                    size="$5"
                    themeInverse
                    borderRadius="$4"
                    marginTop="$2"
                    onPress={handleSubmit}
                    disabled={isLoading}
                    opacity={isLoading ? 0.7 : 1}
                  >
                    {isLoading
                      ? mode === "login"
                        ? "Signing in..."
                        : "Creating account..."
                      : mode === "login"
                        ? "Sign In"
                        : "Create Account"}
                  </Button>
                </YStack>
              </GlassyCard>

              {/* Toggle Link */}
              <XStack justifyContent="center" marginTop="$4">
                <Text color="$color" opacity={0.6} fontSize="$3">
                  {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                </Text>
                <Pressable
                  onPress={() => {
                    Haptics.selectionAsync();
                    router.push(mode === "login" ? "/register" : "/login");
                  }}
                >
                  <Text color="$electricBlue" fontSize="$3" fontWeight="600">
                    {mode === "login" ? "Sign Up" : "Sign In"}
                  </Text>
                </Pressable>
              </XStack>
            </MotiView>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </YStack>
  );
}
