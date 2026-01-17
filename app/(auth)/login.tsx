import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import {
  FormField,
  GlassyButton,
  GlassyCard,
  LoginTransition as LoginSuccessAnimation,
  PasswordField,
  SocialLoginRow,
} from "@/components";
import { useLogin } from "@/lib/hooks/use-auth";
import { getFriendlyErrorMessage } from "@/lib/utils/error-messages";

const Title = styled(Text, {
  color: "white",
  fontSize: 32,
  fontWeight: "900",
  fontFamily: "$heading",
  textAlign: "center",
  marginBottom: 8,
  textShadowColor: "rgba(0, 0, 0, 0.3)",
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 4,
});

const Subtitle = styled(Text, {
  color: "rgba(255, 255, 255, 0.8)",
  fontSize: 16,
  fontFamily: "$body",
  textAlign: "center",
  marginBottom: 32,
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

export default function LoginScreen() {
  const router = useRouter();
  const loginMutation = useLogin();
  const insets = useSafeAreaInsets();

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
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            padding: 20,
            paddingTop: Math.max(insets.top, 20),
            paddingBottom: Math.max(insets.bottom, 20),
          }}
        >
          <YStack maxWidth={500} width="100%" alignSelf="center" space="$4">
            <YStack marginBottom={20}>
              <Title>Welcome Back</Title>
              <Subtitle>Sign in to your Echo account</Subtitle>
            </YStack>

            <GlassyCard forceDark>
              {error ? (
                <ErrorBanner>
                  <ErrorText>{error}</ErrorText>
                </ErrorBanner>
              ) : null}

              <YStack space="$4">
                <FormField
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={(text: string) => {
                    setEmail(text);
                    if (error) setError("");
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                  error={emailError}
                  forceDark
                />

                <PasswordField
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text: string) => {
                    setPassword(text);
                    if (error) setError("");
                  }}
                  editable={!isLoading}
                  error={passwordError}
                  forceDark
                />

                <YStack marginTop={10}>
                  <GlassyButton
                    onPress={handleLogin}
                    disabled={isLoading}
                    opacity={isLoading ? 0.7 : 1}
                  >
                    <Text color="white" fontWeight="700">
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Text>
                  </GlassyButton>
                </YStack>
              </YStack>
            </GlassyCard>

            {/* Social Login Options */}
            <YStack marginTop={24}>
              <SocialLoginRow
                onGooglePress={() => console.log("Google login")}
                onApplePress={() => console.log("Apple login")}
                onFacebookPress={() => console.log("Facebook login")}
                onXPress={() => console.log("X login")}
                onPhonePress={() => console.log("Phone login")}
              />
            </YStack>

            <XStack justifyContent="center" marginTop={16}>
              <Link href="/forgot-password" asChild>
                <Text color="rgba(255, 255, 255, 0.7)" fontSize={14} fontFamily="$body">
                  Forgot your password?
                </Text>
              </Link>
            </XStack>

            <XStack justifyContent="center" marginTop={12}>
              <Text color="rgba(255, 255, 255, 0.7)" fontSize={14} fontFamily="$body">
                Don&apos;t have an account?{" "}
              </Text>
              <Link href="/register" asChild>
                <Text color="$accentColor" fontSize={14} fontWeight="600" fontFamily="$body">
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
