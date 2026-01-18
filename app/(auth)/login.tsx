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
  HUDPasswordInput,
  LoginTransition as LoginSuccessAnimation,
  ScanLine,
  SocialLoginRow,
} from "@/components";
import { useLogin } from "@/lib/hooks/use-auth";
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
        style={{ flex: 1, backgroundColor: "#020203" }}
      >
        <GridBackground gridSize={20} opacity={0.08} />
        <ScanLine height={800} duration={5000} opacity={0.08} />

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
              <Title>Login</Title>
              <Subtitle>Welcome back to Echo</Subtitle>
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
                    if (error) setError("");
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                  error={emailError}
                />

                <HUDPasswordInput
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text: string) => {
                    setPassword(text);
                    if (error) setError("");
                  }}
                  editable={!isLoading}
                  error={passwordError}
                />

                <YStack marginTop={10}>
                  <HUDButton onPress={handleLogin} disabled={isLoading} variant="primary" fullWidth>
                    {isLoading ? "Signing in..." : "Login"}
                  </HUDButton>
                </YStack>
              </YStack>
            </HUDCard>

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
                <Text
                  color="rgba(255, 255, 255, 0.5)"
                  fontSize={12}
                  fontFamily="$body"
                  letterSpacing={0.5}
                >
                  Forgot password?
                </Text>
              </Link>
            </XStack>

            <XStack justifyContent="center" marginTop={12}>
              <Text
                color="rgba(255, 255, 255, 0.5)"
                fontSize={12}
                fontFamily="$body"
                letterSpacing={0.5}
              >
                New to Echo?{" "}
              </Text>
              <Link href="/register" asChild>
                <Text
                  color="$hudActive"
                  fontSize={12}
                  fontWeight="700"
                  fontFamily="$body"
                  letterSpacing={0.5}
                >
                  Register
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
