import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import {
  GridBackground,
  HUDButton,
  HUDCard,
  HUDInput,
  LoginTransition as LoginSuccessAnimation,
  ScanLine,
  SocialLoginRow,
} from "@/components";
import { useRegister } from "@/lib/hooks/use-auth";
import { getFriendlyErrorMessage } from "@/lib/utils/error-messages";

const Title = styled(Text, {
  color: "$hudActive",
  fontSize: 32,
  fontWeight: "900",
  fontFamily: "$heading",
  textAlign: "center",
  marginBottom: 8,
  letterSpacing: 1,
  textShadowColor: "rgba(45, 166, 250, 0.5)",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 10,
});

const Subtitle = styled(Text, {
  color: "rgba(255, 255, 255, 0.6)",
  fontSize: 14,
  fontFamily: "$body",
  textAlign: "center",
  marginBottom: 32,
  letterSpacing: 2,
  textTransform: "uppercase",
});

const ErrorBanner = styled(YStack, {
  backgroundColor: "rgba(255, 45, 85, 0.1)",
  borderRadius: 4,
  padding: 16,
  borderWidth: 1,
  borderColor: "$hudWarning",
  marginBottom: 16,
  shadowColor: "$hudWarning",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.2,
  shadowRadius: 10,
});

const ErrorText = styled(Text, {
  color: "$hudWarning",
  fontSize: 13,
  textAlign: "center",
  fontFamily: "$body",
  letterSpacing: 0.5,
});

export default function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegister();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Field-level validation
  const emailError = hasSubmitted && !email.trim();
  const passwordError = hasSubmitted && (!password || password.length < 8);
  const confirmPasswordError = hasSubmitted && password !== confirmPassword;

  const handleRegister = async () => {
    setError("");
    setHasSubmitted(true);

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    registerMutation.mutate(
      {
        email: email.trim(),
        password,
        username: username.trim() || undefined,
      },
      {
        onSuccess: () => {
          setShowSuccessAnimation(true);
        },
        onError: (err) => {
          const friendlyMessage = getFriendlyErrorMessage(err);
          setError(friendlyMessage);
        },
      },
    );
  };

  const handleAnimationComplete = () => {
    router.replace("/(tabs)");
  };

  const isLoading = registerMutation.isPending;

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, backgroundColor: "#020203" }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <GridBackground gridSize={20} opacity={0.08} />
        <ScanLine height={1000} duration={5000} opacity={0.08} />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 20,
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom + 40, 60),
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <YStack maxWidth={500} width="100%" alignSelf="center" space="$4">
            <YStack marginBottom={20}>
              <Title>Register</Title>
              <Subtitle>Create your Echo account</Subtitle>
            </YStack>

            <HUDCard>
              {error ? (
                <ErrorBanner>
                  <ErrorText>{error}</ErrorText>
                </ErrorBanner>
              ) : null}

              <YStack space="$4">
                <HUDInput
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text: string) => {
                    setEmail(text);
                    clearError();
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                  error={emailError}
                />

                <HUDInput
                  label="Username (Optional)"
                  placeholder="johndoe"
                  value={username}
                  onChangeText={(text: string) => {
                    setUsername(text);
                    clearError();
                  }}
                  autoCapitalize="none"
                  editable={!isLoading}
                />

                <HUDInput
                  label="Password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChangeText={(text: string) => {
                    setPassword(text);
                    clearError();
                  }}
                  secureTextEntry
                  editable={!isLoading}
                  error={passwordError}
                  helperText={
                    hasSubmitted && password && password.length < 8
                      ? "Must be at least 8 characters"
                      : undefined
                  }
                />

                <HUDInput
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={(text: string) => {
                    setConfirmPassword(text);
                    clearError();
                  }}
                  secureTextEntry
                  editable={!isLoading}
                  error={confirmPasswordError}
                  helperText={confirmPasswordError ? "Passwords don't match" : undefined}
                />

                <YStack marginTop={10}>
                  <HUDButton
                    onPress={handleRegister}
                    disabled={isLoading}
                    variant="primary"
                    fullWidth
                  >
                    {isLoading ? "Creating account..." : "Register"}
                  </HUDButton>
                </YStack>
              </YStack>
            </HUDCard>

            {/* Social Login Options */}
            <YStack marginTop={24}>
              <SocialLoginRow
                onGooglePress={() => console.log("Google signup")}
                onApplePress={() => console.log("Apple signup")}
                onFacebookPress={() => console.log("Facebook signup")}
                onXPress={() => console.log("X signup")}
                onPhonePress={() => console.log("Phone signup")}
              />
            </YStack>

            <XStack justifyContent="center" marginTop={20} marginBottom={40}>
              <Text
                color="rgba(255, 255, 255, 0.5)"
                fontSize={12}
                fontFamily="$body"
                letterSpacing={0.5}
              >
                Already have an account?{" "}
              </Text>
              <Link href="/login" asChild>
                <Text
                  color="$hudActive"
                  fontSize={12}
                  fontWeight="700"
                  fontFamily="$body"
                  letterSpacing={0.5}
                >
                  Login
                </Text>
              </Link>
            </XStack>
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoginSuccessAnimation
        isAnimating={showSuccessAnimation}
        onAnimationComplete={handleAnimationComplete}
      />
    </>
  );
}
