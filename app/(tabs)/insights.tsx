import React from "react";
import { Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H2, Text, XStack, YStack, useTheme } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";

// Mock data - replace with real API data
const mockSpending = {
  total: 3456.78,
  trend: -8, // percent change from last month
};

const mockChartData = {
  labels: ["W1", "W2", "W3", "W4"],
  datasets: [
    {
      data: [850, 920, 780, 906],
      strokeWidth: 2,
    },
  ],
};

const mockCategories = [
  { id: "1", name: "Food & Dining", amount: 450, emoji: "🍔", color: "#ef4444" },
  { id: "2", name: "Transport", amount: 320, emoji: "🚗", color: "#3b82f6" },
  { id: "3", name: "Shopping", amount: 280, emoji: "🛍️", color: "#8b5cf6" },
  { id: "4", name: "Entertainment", amount: 180, emoji: "🎬", color: "#22c55e" },
  { id: "5", name: "Bills", amount: 450, emoji: "📄", color: "#f59e0b" },
  { id: "6", name: "Other", amount: 120, emoji: "📦", color: "#6b7280" },
];

const mockRecurring = [
  { id: "1", name: "Netflix", amount: 15.99, nextDate: "Jan 15", emoji: "📺" },
  { id: "2", name: "Spotify", amount: 9.99, nextDate: "Jan 18", emoji: "🎵" },
  { id: "3", name: "Gym Membership", amount: 49.99, nextDate: "Jan 1", emoji: "💪" },
  { id: "4", name: "iCloud", amount: 2.99, nextDate: "Jan 10", emoji: "☁️" },
];

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const screenWidth = Dimensions.get("window").width - 40;

  const chartConfig = {
    backgroundGradientFrom: theme.background?.val || "#0b0f19",
    backgroundGradientTo: theme.background?.val || "#0b0f19",
    color: (opacity = 1) => `rgba(45, 166, 250, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: () => theme.secondaryText?.val || "#9ca3af",
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#2da6fa",
    },
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}>
        {/* Header */}
        <H2 color="$color" fontSize={28} fontWeight="bold" marginBottom="$4">
          Insights
        </H2>

        {/* Total Spent Card with Chart */}
        <GlassyCard marginBottom="$6">
          <YStack padding="$4" gap="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack>
                <Text color="$secondaryText" fontSize={12} textTransform="uppercase">
                  Total Spent This Month
                </Text>
                <Text color="$color" fontSize={32} fontWeight="bold">
                  ${mockSpending.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
              </YStack>
              <YStack
                backgroundColor={
                  mockSpending.trend < 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"
                }
                paddingHorizontal="$3"
                paddingVertical="$1"
                borderRadius="$4"
              >
                <Text
                  color={mockSpending.trend < 0 ? "#22c55e" : "#ef4444"}
                  fontSize={14}
                  fontWeight="600"
                >
                  {mockSpending.trend < 0 ? "↓" : "↑"} {Math.abs(mockSpending.trend)}%
                </Text>
              </YStack>
            </XStack>

            {/* Chart */}
            <YStack marginTop="$2" marginHorizontal={-16}>
              <LineChart
                data={mockChartData}
                width={screenWidth + 32}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={false}
              />
            </YStack>
          </YStack>
        </GlassyCard>

        {/* Top Categories */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Top Categories
        </Text>
        <XStack flexWrap="wrap" gap="$3" marginBottom="$6">
          {mockCategories.map((category) => (
            <GlassyCard key={category.id} width="31%">
              <YStack padding="$3" alignItems="center" gap="$2">
                <YStack
                  backgroundColor={category.color as any}
                  width={40}
                  height={40}
                  borderRadius={20}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={20}>{category.emoji}</Text>
                </YStack>
                <Text color="$color" fontSize={14} fontWeight="bold">
                  ${category.amount}
                </Text>
                <Text color="$secondaryText" fontSize={10} textAlign="center" numberOfLines={1}>
                  {category.name}
                </Text>
              </YStack>
            </GlassyCard>
          ))}
        </XStack>

        {/* Recurring Subscriptions */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text color="$color" fontSize={18} fontWeight="bold">
            Recurring
          </Text>
          <Text color="$accentColor" fontSize={14}>
            ${mockRecurring.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}/mo
          </Text>
        </XStack>
        <GlassyCard>
          <YStack>
            {mockRecurring.map((sub, index) => (
              <XStack
                key={sub.id}
                padding="$3"
                alignItems="center"
                gap="$3"
                borderBottomWidth={index < mockRecurring.length - 1 ? 1 : 0}
                borderBottomColor="$borderColor"
              >
                <YStack
                  backgroundColor="$backgroundHover"
                  width={44}
                  height={44}
                  borderRadius={22}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={20}>{sub.emoji}</Text>
                </YStack>
                <YStack flex={1}>
                  <Text color="$color" fontWeight="600">
                    {sub.name}
                  </Text>
                  <Text color="$secondaryText" fontSize={12}>
                    Next: {sub.nextDate}
                  </Text>
                </YStack>
                <Text color="$color" fontWeight="bold">
                  ${sub.amount}
                </Text>
              </XStack>
            ))}
          </YStack>
        </GlassyCard>
      </ScrollView>
    </YStack>
  );
}
