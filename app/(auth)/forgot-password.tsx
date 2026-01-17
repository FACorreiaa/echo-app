import { Link } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { FormField, GlassyButton, GlassyCard } from "@/components";

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

const SuccessBanner = styled(YStack, {
  backgroundColor: "rgba(34, 197, 94, 0.1)",
  borderRadius: 12,
  padding: 16,
  borderWidth: 1,
  borderColor: "rgba(34, 197, 94, 0.3)",
  marginBottom: 16,
});

const SuccessText = styled(Text, {
  color: "#22c55e",
  fontSize: 14,
  textAlign: "center",
  fontFamily: "$body",
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

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const emailError = hasSubmitted && !email.trim();

  const handleSubmit = async () => {
    setError("");
    setHasSubmitted(true);

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // TODO: Implement actual password reset API call
    // For now, simulate a successful request
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setSuccess(true);
  };

  return (
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
            <Title>Reset Password</Title>
            <Subtitle>
              Enter your email and we&apos;ll send you a link to reset your password
            </Subtitle>
          </YStack>

          <GlassyCard forceDark>
            {success ? (
              <SuccessBanner>
                <SuccessText>
                  If an account exists with that email, you&apos;ll receive a password reset link
                  shortly.
                </SuccessText>
              </SuccessBanner>
            ) : error ? (
              <ErrorBanner>
                <ErrorText>{error}</ErrorText>
              </ErrorBanner>
            ) : null}

            {!success && (
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

                <YStack marginTop={10}>
                  <GlassyButton
                    onPress={handleSubmit}
                    disabled={isLoading}
                    opacity={isLoading ? 0.7 : 1}
                  >
                    <Text color="white" fontWeight="700">
                      {isLoading ? "Sending..." : "Send Reset Link"}
                    </Text>
                  </GlassyButton>
                </YStack>
              </YStack>
            )}

            {success && (
              <Link href="/login" asChild>
                <GlassyButton>
                  <Text color="white" fontWeight="700">
                    Back to Sign In
                  </Text>
                </GlassyButton>
              </Link>
            )}
          </GlassyCard>

          <XStack justifyContent="center" marginTop={16}>
            <Text color="rgba(255, 255, 255, 0.7)" fontSize={14} fontFamily="$body">
              Remember your password?{" "}
            </Text>
            <Link href="/login" asChild>
              <Text color="$accentColor" fontSize={14} fontWeight="600" fontFamily="$body">
                Sign In
              </Text>
            </Link>
          </XStack>
        </YStack>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
