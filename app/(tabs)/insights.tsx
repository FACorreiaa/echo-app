import React from "react";
import { ActivityIndicator, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { H2, Text, XStack, YStack, useTheme } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import { useMonthlyInsights, useSpendingPulse } from "@/lib/hooks/use-insights";
import { useSubscriptions } from "@/lib/hooks/use-subscriptions";
import { MonthlyInsightsCard } from "@/widgets/insights";

// Category colors for display
const CATEGORY_COLORS: Record<string, string> = {
  "Food & Dining": "#ef4444",
  "Dining Out": "#ef4444",
  Transport: "#3b82f6",
  Transportation: "#3b82f6",
  Shopping: "#8b5cf6",
  Entertainment: "#22c55e",
  Bills: "#f59e0b",
  Utilities: "#f59e0b",
  Other: "#6b7280",
  Uncategorized: "#6b7280",
};

// Category emojis for display
const CATEGORY_EMOJIS: Record<string, string> = {
  "Food & Dining": "🍔",
  "Dining Out": "🍔",
  Transport: "🚗",
  Transportation: "🚗",
  Shopping: "🛍️",
  Entertainment: "🎬",
  Bills: "📄",
  Utilities: "💡",
  Subscriptions: "📺",
  Other: "📦",
  Uncategorized: "📦",
};

// Format next date for subscription display
function formatNextDate(date: Date | null) {
  if (!date) return "Unknown";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const screenWidth = Dimensions.get("window").width - 40;

  // Fetch spending pulse data (replaces mockSpending and mockCategories)
  const { data: pulse, isLoading: pulseLoading, error: pulseError } = useSpendingPulse();

  // Fetch monthly insights
  const { data: monthlyInsights, isLoading: insightsLoading } = useMonthlyInsights();

  // Fetch subscriptions (replaces mockRecurring)
  const { data: subsData, isLoading: subscriptionsLoading } = useSubscriptions("active");
  const subscriptions = subsData?.subscriptions ?? [];

  // Build chart data from spending pulse
  const chartData = {
    labels: ["W1", "W2", "W3", "W4"],
    datasets: [
      {
        data: pulse
          ? [
              pulse.currentMonthSpend * 0.25,
              pulse.currentMonthSpend * 0.3,
              pulse.currentMonthSpend * 0.2,
              pulse.currentMonthSpend * 0.25,
            ]
          : [0, 0, 0, 0],
        strokeWidth: 2,
      },
    ],
  };

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

  // Calculate spending trend from pulse data
  const spendingTrend = pulse
    ? Math.round(
        ((pulse.currentMonthSpend - pulse.lastMonthSpend) / Math.max(pulse.lastMonthSpend, 1)) *
          100,
      )
    : 0;

  // Get top categories from pulse
  const topCategories = pulse?.topCategories.slice(0, 6) ?? [];

  // Calculate total recurring amount
  const totalRecurring = subscriptions?.reduce((sum, s) => sum + s.amount, 0) ?? 0;

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}>
        {/* Header */}
        <H2 color="$color" fontSize={28} fontWeight="bold" marginBottom="$4">
          Insights
        </H2>

        {/* Monthly Insights Card */}
        {monthlyInsights && (
          <YStack marginBottom="$6">
            <MonthlyInsightsCard
              month={monthlyInsights.month}
              thingsChanged={monthlyInsights.thingsChanged}
              recommendedAction={monthlyInsights.recommendedAction}
              isLoading={insightsLoading}
              onInsightPress={(insight) => {
                console.log("Insight pressed:", insight);
              }}
              onActionPress={(action) => {
                console.log("Action pressed:", action);
              }}
            />
          </YStack>
        )}

        {/* Total Spent Card with Chart */}
        <GlassyCard marginBottom="$6">
          <YStack padding="$4" gap="$3">
            {pulseLoading ? (
              <YStack alignItems="center" padding="$6">
                <ActivityIndicator color="#2da6fa" />
                <Text color="$secondaryText" marginTop="$2">
                  Loading spending data...
                </Text>
              </YStack>
            ) : pulseError ? (
              <YStack padding="$4">
                <Text color="$secondaryText" textAlign="center">
                  Unable to load spending data
                </Text>
              </YStack>
            ) : (
              <>
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack>
                    <Text color="$secondaryText" fontSize={12} textTransform="uppercase">
                      Total Spent This Month
                    </Text>
                    <Text color="$color" fontSize={32} fontWeight="bold">
                      €
                      {(pulse?.currentMonthSpend ?? 0).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </YStack>
                  <YStack
                    backgroundColor={
                      spendingTrend < 0 ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)"
                    }
                    paddingHorizontal="$3"
                    paddingVertical="$1"
                    borderRadius="$4"
                  >
                    <Text
                      color={spendingTrend < 0 ? "#22c55e" : "#ef4444"}
                      fontSize={14}
                      fontWeight="600"
                    >
                      {spendingTrend < 0 ? "↓" : "↑"} {Math.abs(spendingTrend)}%
                    </Text>
                  </YStack>
                </XStack>

                {/* Chart */}
                <YStack marginTop="$2" marginHorizontal={-16}>
                  <LineChart
                    data={chartData}
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
              </>
            )}
          </YStack>
        </GlassyCard>

        {/* Top Categories - from SpendingPulse API */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Top Categories
        </Text>
        <XStack flexWrap="wrap" gap="$3" marginBottom="$6">
          {pulseLoading ? (
            <YStack flex={1} alignItems="center" padding="$4">
              <ActivityIndicator color="#2da6fa" />
            </YStack>
          ) : topCategories.length === 0 ? (
            <GlassyCard width="100%">
              <YStack padding="$4" alignItems="center">
                <Text color="$secondaryText">No spending data yet</Text>
              </YStack>
            </GlassyCard>
          ) : (
            topCategories.map((category) => (
              <GlassyCard key={category.categoryId ?? category.categoryName} width="31%">
                <YStack padding="$3" alignItems="center" gap="$2">
                  <YStack
                    backgroundColor={(CATEGORY_COLORS[category.categoryName] ?? "#6b7280") as any}
                    width={40}
                    height={40}
                    borderRadius={20}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={20}>{CATEGORY_EMOJIS[category.categoryName] ?? "📦"}</Text>
                  </YStack>
                  <Text color="$color" fontSize={14} fontWeight="bold">
                    €{category.amount.toFixed(0)}
                  </Text>
                  <Text color="$secondaryText" fontSize={10} textAlign="center" numberOfLines={1}>
                    {category.categoryName}
                  </Text>
                </YStack>
              </GlassyCard>
            ))
          )}
        </XStack>

        {/* Recurring Subscriptions - from Subscriptions API */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text color="$color" fontSize={18} fontWeight="bold">
            Recurring
          </Text>
          <Text color="$accentColor" fontSize={14}>
            €{totalRecurring.toFixed(2)}/mo
          </Text>
        </XStack>
        <GlassyCard>
          <YStack>
            {subscriptionsLoading ? (
              <YStack padding="$4" alignItems="center">
                <ActivityIndicator color="#2da6fa" />
              </YStack>
            ) : !subscriptions || subscriptions.length === 0 ? (
              <YStack padding="$4" alignItems="center">
                <Text color="$secondaryText">No recurring subscriptions detected</Text>
              </YStack>
            ) : (
              subscriptions.slice(0, 5).map((sub, index) => (
                <XStack
                  key={sub.id}
                  padding="$3"
                  alignItems="center"
                  gap="$3"
                  borderBottomWidth={index < Math.min(subscriptions.length, 5) - 1 ? 1 : 0}
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
                    <Text fontSize={20}>📺</Text>
                  </YStack>
                  <YStack flex={1}>
                    <Text color="$color" fontWeight="600">
                      {sub.merchantName}
                    </Text>
                    <Text color="$secondaryText" fontSize={12}>
                      Next: {formatNextDate(sub.nextExpectedAt)}
                    </Text>
                  </YStack>
                  <Text color="$color" fontWeight="bold">
                    €{sub.amount.toFixed(2)}
                  </Text>
                </XStack>
              ))
            )}
          </YStack>
        </GlassyCard>
      </ScrollView>
    </YStack>
  );
}
