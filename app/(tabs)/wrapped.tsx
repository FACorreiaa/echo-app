import { Sparkles } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components";
import { useWrapped } from "@/lib/hooks/use-wrapped";

type TabType = "saver" | "networth";

export default function WrappedScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("saver");

  // Get current month dates
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Fetch wrapped data
  const { data: wrapped, isLoading } = useWrapped("month", monthStart, monthEnd);

  const selectedMonth = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  // Get top card for hero section
  const heroCard = wrapped?.cards?.[0];

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

        {/* Loading State */}
        {isLoading && (
          <GlassyCard marginBottom="$4">
            <YStack padding="$6" alignItems="center">
              <ActivityIndicator />
              <Text color="$secondaryText" marginTop="$2">
                Loading your highlights...
              </Text>
            </YStack>
          </GlassyCard>
        )}

        {/* Hero Card */}
        {!isLoading && heroCard && (
          <GlassyCard marginBottom="$4">
            <YStack
              backgroundColor={(heroCard.accent || "$accentGradientStart") as any}
              borderRadius="$4"
              padding="$4"
              gap="$2"
            >
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
                {heroCard.body}
              </Text>
              <Text color="white" opacity={0.8}>
                {heroCard.subtitle}
              </Text>
            </YStack>
          </GlassyCard>
        )}

        {/* Highlights Grid */}
        {!isLoading && wrapped?.cards && wrapped.cards.length > 1 && (
          <>
            <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
              Highlights
            </Text>
            <XStack gap="$3" marginBottom="$4" flexWrap="wrap">
              {wrapped.cards.slice(1).map((card, index) => (
                <GlassyCard key={index} flex={1} minWidth={150}>
                  <YStack alignItems="center" padding="$3" gap="$2">
                    <YStack
                      backgroundColor={card.accent as any}
                      width={40}
                      height={40}
                      borderRadius={20}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text color="white" fontWeight="bold">
                        {card.title.charAt(0)}
                      </Text>
                    </YStack>
                    <Text color="$color" fontSize={18} fontWeight="bold" textAlign="center">
                      {card.body}
                    </Text>
                    <Text color="$secondaryText" fontSize={12} textAlign="center">
                      {card.title}
                    </Text>
                  </YStack>
                </GlassyCard>
              ))}
            </XStack>
          </>
        )}

        {/* Empty State */}
        {!isLoading && (!wrapped?.cards || wrapped.cards.length === 0) && (
          <GlassyCard>
            <YStack padding="$6" alignItems="center" gap="$3">
              <Sparkles size={48} color="$secondaryText" />
              <Text color="$color" fontSize={18} fontWeight="bold" textAlign="center">
                No Highlights Yet
              </Text>
              <Text color="$secondaryText" textAlign="center">
                Start tracking your spending to see your monthly wrapped!
              </Text>
            </YStack>
          </GlassyCard>
        )}

        {/* Upgrade Card */}
        <GlassyCard marginTop="$4">
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
