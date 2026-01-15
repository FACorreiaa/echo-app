/**
 * OnboardingFlow - Multi-step onboarding for new users
 *
 * Steps:
 * 1. Welcome - Brand introduction
 * 2. Set Balance - Enter starting balance
 * 3. Complete - Success and navigate to app
 */

import { MotiView } from "moti";
import React, { useState } from "react";
import { ActivityIndicator, Keyboard, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Input, Text, XStack, YStack } from "tamagui";

import { GlassyButton } from "@/components/ui/GlassyButton";
import { GlassyCard } from "@/components/ui/GlassyCard";
import { useSetOpeningBalance } from "@/lib/hooks/use-balance";
import { useAuthStore } from "@/lib/stores/auth-store";

type OnboardingStep = "welcome" | "balance" | "complete";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [balanceInput, setBalanceInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const insets = useSafeAreaInsets();
  const setOpeningBalance = useSetOpeningBalance();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);

  const handleSetBalance = async () => {
    const amount = parseFloat(balanceInput.replace(",", "."));
    if (isNaN(amount)) {
      setError("Please enter a valid amount");
      return;
    }

    // Convert to cents
    const amountMinor = Math.round(amount * 100);

    try {
      await setOpeningBalance.mutateAsync({ amountMinor, currencyCode: "EUR" });
      setStep("complete");
    } catch {
      setError("Failed to save balance. Please try again.");
    }
  };

  const handleComplete = async () => {
    completeOnboarding();
    // Wait for Zustand to persist to AsyncStorage before navigating
    await new Promise((resolve) => setTimeout(resolve, 150));
    onComplete();
  };

  const handleSkipBalance = () => {
    // Allow skipping - they can set it later
    setStep("complete");
  };

  return (
    <YStack
      flex={1}
      backgroundColor="$background"
      paddingHorizontal="$5"
      paddingTop={insets.top + 20}
      paddingBottom={insets.bottom + 20}
    >
      {/* Step 1: Welcome */}
      {step === "welcome" && (
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ flex: 1 }}
        >
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$6">
            <YStack alignItems="center" gap="$3">
              <Text fontSize={56} fontWeight="900" color="$color" letterSpacing={-1}>
                Echo
              </Text>
              <Text color="$secondaryText" fontSize="$5" textAlign="center">
                The Alive Money OS
              </Text>
            </YStack>

            <YStack alignItems="center" gap="$4" paddingTop="$6">
              <Text color="$color" fontSize="$6" fontWeight="600" textAlign="center">
                Welcome! 👋
              </Text>
              <Text color="$secondaryText" fontSize="$4" textAlign="center" maxWidth={280}>
                Let's set up your financial health in just a few seconds.
              </Text>
            </YStack>

            <YStack flex={1} />

            <YStack width="100%">
              <GlassyButton onPress={() => setStep("balance")}>Get Started</GlassyButton>
            </YStack>
          </YStack>
        </MotiView>
      )}

      {/* Step 2: Set Balance */}
      {step === "balance" && (
        <MotiView
          from={{ opacity: 0, translateX: 20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ flex: 1 }}
        >
          <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
            <YStack flex={1} gap="$5">
              <YStack gap="$2" paddingTop="$6">
                <H2 color="$color">Set Your Balance</H2>
                <Text color="$secondaryText" fontSize="$4">
                  What's your current total balance across all accounts?
                </Text>
              </YStack>

              <GlassyCard>
                <YStack padding="$4" gap="$4">
                  <Text color="$secondaryText" fontSize="$3">
                    Starting Balance
                  </Text>
                  <XStack alignItems="center" gap="$2">
                    <Text fontSize="$8" fontWeight="bold" color="$color">
                      €
                    </Text>
                    <Input
                      flex={1}
                      size="$6"
                      placeholder="2,000"
                      keyboardType="decimal-pad"
                      value={balanceInput}
                      onChangeText={(text) => {
                        setBalanceInput(text);
                        setError(null);
                      }}
                      borderWidth={0}
                      backgroundColor="transparent"
                      color="$color"
                      placeholderTextColor="$placeholderColor"
                    />
                  </XStack>
                  {error && (
                    <Text color="$red10" fontSize="$3">
                      {error}
                    </Text>
                  )}
                </YStack>
              </GlassyCard>

              <GlassyCard>
                <YStack padding="$3" gap="$2">
                  <Text color="$color" fontWeight="600" fontSize="$3">
                    💡 What is this?
                  </Text>
                  <Text color="$secondaryText" fontSize="$3">
                    This is your starting point. Echo will track all future transactions from here,
                    so your net worth stays accurate.
                  </Text>
                </YStack>
              </GlassyCard>

              <YStack flex={1} />

              <YStack gap="$3">
                <GlassyButton
                  onPress={handleSetBalance}
                  disabled={!balanceInput || setOpeningBalance.isPending}
                >
                  {setOpeningBalance.isPending ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    "Continue"
                  )}
                </GlassyButton>
                <Button
                  backgroundColor="transparent"
                  color="$secondaryText"
                  onPress={handleSkipBalance}
                >
                  Skip for now
                </Button>
              </YStack>
            </YStack>
          </Pressable>
        </MotiView>
      )}

      {/* Step 3: Complete */}
      {step === "complete" && (
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 400 }}
          style={{ flex: 1 }}
        >
          <YStack flex={1} justifyContent="center" alignItems="center" gap="$6">
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
            >
              <Text fontSize={80}>🎉</Text>
            </MotiView>

            <YStack alignItems="center" gap="$3">
              <Text fontSize="$8" fontWeight="bold" color="$color" textAlign="center">
                You're all set!
              </Text>
              <Text color="$secondaryText" fontSize="$4" textAlign="center" maxWidth={280}>
                Echo is ready to help you track your finances and build healthy money habits.
              </Text>
            </YStack>

            <YStack flex={1} />

            <YStack width="100%">
              <GlassyButton onPress={handleComplete}>Start Using Echo</GlassyButton>
            </YStack>
          </YStack>
        </MotiView>
      )}
    </YStack>
  );
}

export default OnboardingFlow;
