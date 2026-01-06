import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { GlassyButton } from "@/components/GlassyButton";
import { GlassyCard } from "@/components/GlassyCard";
import { Input } from "@/components/Input";
import { LoginSuccessAnimation } from "@/components/LoginTransition";
import { PasswordInput } from "@/components/PasswordInput";
import { useRegister } from "@/lib/hooks/use-auth";
import { getFriendlyErrorMessage } from "@/lib/utils/error-messages";

const Title = styled(Text, {
  color: "$color",
  fontSize: 32,
  fontFamily: "$heading",
  textAlign: "center",
  marginBottom: 8,
});

const Subtitle = styled(Text, {
  color: "$color",
  opacity: 0.6,
  fontSize: 16,
  fontFamily: "$body",
  textAlign: "center",
  marginBottom: 32,
});

const Label = styled(Text, {
  color: "$color",
  fontSize: 14,
  fontFamily: "$body",
  marginBottom: 6,
  marginLeft: 4,
});

const ErrorBanner = styled(YStack, {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: "rgba(239, 68, 68, 0.3)",
  marginBottom: 16,
});

const ErrorText = styled(Text, {
  color: "#ef4444",
  fontSize: 14,
  textAlign: "center",
  fontFamily: "$body",
});

export default function RegisterScreen() {
  const router = useRouter();
  const registerMutation = useRegister();

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
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
          <YStack maxWidth={500} width="100%" alignSelf="center" space="$4">
            <YStack marginBottom={20}>
              <Title>Join Echo</Title>
              <Subtitle>Start your intelligent financial journey</Subtitle>
            </YStack>

            <GlassyCard>
              {error ? (
                <ErrorBanner>
                  <ErrorText>{error}</ErrorText>
                </ErrorBanner>
              ) : null}

              <YStack space="$4">
                <YStack>
                  <Label>Email</Label>
                  <Input
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
                </YStack>

                <YStack>
                  <Label>Username (Optional)</Label>
                  <Input
                    placeholder="johndoe"
                    value={username}
                    onChangeText={(text: string) => {
                      setUsername(text);
                      clearError();
                    }}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </YStack>

                <YStack>
                  <Label>Password</Label>
                  <PasswordInput
                    placeholder="Min. 8 characters"
                    value={password}
                    onChangeText={(text: string) => {
                      setPassword(text);
                      clearError();
                    }}
                    editable={!isLoading}
                    error={passwordError}
                    errorMessage={
                      hasSubmitted && password && password.length < 8
                        ? "Must be at least 8 characters"
                        : undefined
                    }
                  />
                </YStack>

                <YStack>
                  <Label>Confirm Password</Label>
                  <PasswordInput
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={(text: string) => {
                      setConfirmPassword(text);
                      clearError();
                    }}
                    editable={!isLoading}
                    error={confirmPasswordError}
                    errorMessage={confirmPasswordError ? "Passwords don't match" : undefined}
                  />
                </YStack>

                <YStack marginTop={10}>
                  <GlassyButton
                    onPress={handleRegister}
                    disabled={isLoading}
                    opacity={isLoading ? 0.7 : 1}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </GlassyButton>
                </YStack>
              </YStack>
            </GlassyCard>

            <XStack justifyContent="center" marginTop={20} marginBottom={40}>
              <Text color="$color" opacity={0.6} fontSize={14} fontFamily="$body">
                Already have an account?{" "}
              </Text>
              <Link href="/login" asChild>
                <Text color="$electricBlue" fontSize={14} fontFamily="$body">
                  Sign In
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
