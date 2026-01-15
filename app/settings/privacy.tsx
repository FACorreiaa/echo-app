import { Database, EyeOff, Lock, Share } from "@tamagui/lucide-icons";
import { Stack } from "expo-router";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, H2, Paragraph, ScrollView, Text, XStack, YStack } from "tamagui";

import { GlassyCard, GradientBackground } from "@/components";

export default function PrivacyScreen() {
  const pillars = [
    {
      icon: EyeOff,
      title: "Read-Only Promise",
      description:
        "Echo analyzes your financial history to give you insights, but we never have the power to move, touch, or access your real-world funds.",
    },
    {
      icon: Lock,
      title: "Local Encryption",
      description:
        "Your bank strings are processed securely on your device using industry-standard encryption. They remain invisible to everyone but you.",
    },
    {
      icon: Database,
      title: "No Data Silos",
      description:
        "Your financial plan shouldn't be a secret held by a corporation. You own the master copy of your strategy in your spreadsheet.",
    },
  ];

  return (
    <GradientBackground>
      <Stack.Screen options={{ title: "Privacy", headerBackTitle: "Settings" }} />
      <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          <YStack gap="$6">
            {/* Header */}
            <YStack gap="$2" marginTop="$4">
              <H2 textAlign="center" color="$color" fontSize={28} fontWeight="bold">
                Your Data. Your Terms.
              </H2>
              <Paragraph textAlign="center" color="$secondaryText" fontSize={16}>
                Echo is architected to be a "Read-Only" operating system. We don't just protect your
                data—we ensure you own it.
              </Paragraph>
            </YStack>

            {/* Pillars */}
            <YStack gap="$4">
              {pillars.map((pillar) => (
                <GlassyCard key={pillar.title} p="$4" animation="medium">
                  <XStack gap="$4">
                    <YStack
                      backgroundColor="$backgroundHover"
                      p="$3"
                      borderRadius="$4"
                      alignSelf="flex-start"
                    >
                      <pillar.icon size={24} color="$accentGradientStart" />
                    </YStack>
                    <YStack flex={1} gap="$2">
                      <Text color="$color" fontSize={18} fontWeight="600">
                        {pillar.title}
                      </Text>
                      <Paragraph color="$secondaryText" fontSize={14} lineHeight={22}>
                        {pillar.description}
                      </Paragraph>
                    </YStack>
                  </XStack>
                </GlassyCard>
              ))}
            </YStack>

            {/* Export Data Action */}
            <GlassyCard p="$5" mt="$4">
              <YStack alignItems="center" gap="$4">
                <Database size={40} color="$secondaryText" />
                <YStack gap="$1" alignItems="center">
                  <Text color="$color" fontSize={18} fontWeight="bold">
                    Export Your Data
                  </Text>
                  <Text color="$secondaryText" textAlign="center" fontSize={13}>
                    Download a full copy of your transaction history and plan configuration.
                  </Text>
                </YStack>
                <Button
                  backgroundColor="$accentGradientStart"
                  color="white"
                  fontWeight="bold"
                  width="100%"
                  icon={Share}
                  onPress={() => alert("Export feature coming in v1.0")}
                >
                  Export Data (JSON)
                </Button>
              </YStack>
            </GlassyCard>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
