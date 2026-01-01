import { Sparkles } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";

// Mock data - replace with real API data
const mockHighlights = [
  { id: 1, label: "Saver Status", value: "Top 1%", icon: "💎" },
  { id: 2, label: "Net Worth", value: "+$1,240", icon: "📈" },
];

const mockTopMerchant = {
  name: "Whole Foods",
  visits: 8,
  emoji: "🛒",
};

type TabType = "saver" | "networth";

export default function WrappedScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("saver");
  const [selectedMonth] = useState("December 2024");

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Header */}
        <YStack marginBottom="$4">
          <Text color="$secondaryText" fontSize={12} textTransform="uppercase">
            YOUR MONTHLY
          </Text>
          <XStack alignItems="center" justifyContent="space-between">
            <H2 color="$color" fontSize={32} fontWeight="bold">
              Wrapped
            </H2>
            <Sparkles size={28} color="$accentColor" />
          </XStack>
        </YStack>

        {/* Tab Switcher */}
        <XStack backgroundColor="$backgroundHover" borderRadius="$4" padding="$1" marginBottom="$6">
          <Button
            flex={1}
            size="$3"
            backgroundColor={activeTab === "saver" ? "$accentColor" : "transparent"}
            color={activeTab === "saver" ? "white" : "$secondaryText"}
            onPress={() => setActiveTab("saver")}
            borderRadius="$3"
          >
            Saver Status
          </Button>
          <Button
            flex={1}
            size="$3"
            backgroundColor={activeTab === "networth" ? "$accentColor" : "transparent"}
            color={activeTab === "networth" ? "white" : "$secondaryText"}
            onPress={() => setActiveTab("networth")}
            borderRadius="$3"
          >
            Net Worth
          </Button>
        </XStack>

        {/* Monthly Card */}
        <GlassyCard marginBottom="$4">
          <YStack backgroundColor="$accentGradientStart" borderRadius="$4" padding="$4" gap="$2">
            <XStack justifyContent="space-between" alignItems="center">
              <Text color="white" fontSize={12} textTransform="uppercase" opacity={0.8}>
                {selectedMonth} Review
              </Text>
              <YStack
                backgroundColor="rgba(255,255,255,0.2)"
                paddingHorizontal="$2"
                paddingVertical="$1"
                borderRadius="$2"
              >
                <Text color="white" fontSize={10} fontWeight="bold">
                  NEW
                </Text>
              </YStack>
            </XStack>
            <Text color="white" fontSize={24} fontWeight="bold">
              You spent 12% less on coffee this month.
            </Text>
            <Text color="white" opacity={0.8}>
              That's enough to buy 4 extra lattes!
            </Text>
            <XStack alignItems="center" gap="$2" marginTop="$2">
              <Text color="white" fontWeight="600">
                Tap to view story
              </Text>
              <Text color="white">→</Text>
            </XStack>
          </YStack>
        </GlassyCard>

        {/* Highlights */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Highlights
        </Text>
        <XStack gap="$3" marginBottom="$4">
          {mockHighlights.map((highlight) => (
            <GlassyCard key={highlight.id} flex={1}>
              <YStack alignItems="center" padding="$3" gap="$2">
                <Text fontSize={24}>{highlight.icon}</Text>
                <Text color="$color" fontSize={20} fontWeight="bold">
                  {highlight.value}
                </Text>
                <Text color="$secondaryText" fontSize={12}>
                  {highlight.label}
                </Text>
              </YStack>
            </GlassyCard>
          ))}
        </XStack>

        {/* Top Merchant */}
        <GlassyCard marginBottom="$4">
          <XStack padding="$4" alignItems="center" gap="$3">
            <YStack
              backgroundColor="$backgroundHover"
              width={48}
              height={48}
              borderRadius={24}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={24}>{mockTopMerchant.emoji}</Text>
            </YStack>
            <YStack flex={1}>
              <Text color="$color" fontWeight="bold">
                Top Merchant
              </Text>
              <Text color="$secondaryText">
                You visited {mockTopMerchant.name} {mockTopMerchant.visits} times.
              </Text>
            </YStack>
          </XStack>
        </GlassyCard>

        {/* Upgrade Card */}
        <GlassyCard>
          <YStack
            padding="$4"
            alignItems="center"
            gap="$3"
            backgroundColor="$backgroundHover"
            borderRadius="$4"
          >
            <Text color="$color" fontSize={18} fontWeight="bold" textAlign="center">
              Unlock Full History
            </Text>
            <Text color="$secondaryText" textAlign="center">
              Get deep insights into your spending habits over the last year.
            </Text>
            <Button
              backgroundColor="$color"
              color="$background"
              size="$4"
              borderRadius="$4"
              marginTop="$2"
            >
              Upgrade to Pro
            </Button>
          </YStack>
        </GlassyCard>
      </ScrollView>
    </YStack>
  );
}
