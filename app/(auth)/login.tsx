import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { GlassyButton } from "@/components/GlassyButton";
import { GlassyCard } from "@/components/GlassyCard";
import { Input } from "@/components/Input";
import { LoginSuccessAnimation } from "@/components/LoginTransition";
import { useLogin } from "@/lib/hooks/use-auth";
import { getFriendlyErrorMessage } from "@/lib/utils/error-messages";

const Title = styled(Text, {
  color: "$color",
  fontSize: 32,
  fontFamily: "Outfit_700Bold",
  textAlign: "center",
  marginBottom: 8,
});

const Subtitle = styled(Text, {
  color: "$color",
  opacity: 0.6,
  fontSize: 16,
  fontFamily: "Outfit_400Regular",
  textAlign: "center",
  marginBottom: 32,
});

const Label = styled(Text, {
  color: "$color",
  fontSize: 14,
  fontFamily: "Outfit_500Medium",
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
  fontFamily: "Outfit_500Medium",
});

export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Field-level validation
  const emailError = hasSubmitted && !email.trim();
  const passwordError = hasSubmitted && !password;

  const handleLogin = async () => {
    setError("");
    setHasSubmitted(true);

    if (!email.trim() || !password) {
      setError("Please fill in all required fields");
      return;
    }

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          setShowSuccessAnimation(true);
        },
        onError: (err) => {
          // Use friendly error messages
          const friendlyMessage = getFriendlyErrorMessage(err);
          setError(friendlyMessage);
        },
      },
    );
  };

  const handleAnimationComplete = () => {
    router.replace("/(tabs)");
  };

  const isLoading = loginMutation.isPending;

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
          <YStack maxWidth={500} width="100%" alignSelf="center" space="$4">
            <YStack marginBottom={20}>
              <Title>Welcome Back</Title>
              <Subtitle>Sign in to your Echo account</Subtitle>
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
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError("");
                    }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    editable={!isLoading}
                    error={emailError}
                  />
                </YStack>

                <YStack>
                  <Label>Password</Label>
                  <Input
                    placeholder="••••••••"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (error) setError("");
                    }}
                    secureTextEntry
                    editable={!isLoading}
                    error={passwordError}
                  />
                </YStack>

                <YStack marginTop={10}>
                  <GlassyButton
                    onPress={handleLogin}
                    disabled={isLoading}
                    opacity={isLoading ? 0.7 : 1}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </GlassyButton>
                </YStack>
              </YStack>
            </GlassyCard>

            <XStack justifyContent="center" marginTop={20}>
              <Text color="$color" opacity={0.6} fontSize={14} fontFamily="Outfit_400Regular">
                Don&apos;t have an account?{" "}
              </Text>
              <Link href="/register" asChild>
                <Text color="$electricBlue" fontSize={14} fontFamily="Outfit_500Medium">
                  Sign Up
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
