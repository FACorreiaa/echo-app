/**
 * BalanceHistoryChart - Line chart showing balance over time
 *
 * Features:
 * - Daily balance line chart
 * - High/Low/Average stats
 * - Tap to see specific day value
 */

import React from "react";
import { ActivityIndicator, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";
import { useBalanceHistory } from "@/lib/hooks/use-balance";

const screenWidth = Dimensions.get("window").width;

// Format currency
const formatCurrency = (amount: number, compact = false) => {
  if (compact && Math.abs(amount) >= 1000) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "EUR",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface BalanceHistoryChartProps {
  days?: number;
  accountId?: string;
}

export function BalanceHistoryChart({ days = 30, accountId }: BalanceHistoryChartProps) {
  const { data: history, isLoading, isError } = useBalanceHistory(days, accountId);

  if (isLoading) {
    return (
      <GlassyCard marginBottom="$4">
        <YStack padding="$4" alignItems="center" justifyContent="center" height={180}>
          <ActivityIndicator />
          <Text color="$secondaryText" marginTop="$2" fontSize={12}>
            Loading chart...
          </Text>
        </YStack>
      </GlassyCard>
    );
  }

  if (isError || !history || history.history.length === 0) {
    return (
      <GlassyCard marginBottom="$4">
        <YStack padding="$4" alignItems="center">
          <Text fontSize={24}>📊</Text>
          <Text color="$secondaryText" marginTop="$2" fontSize={12}>
            Not enough data for chart
          </Text>
          <Text color="$secondaryText" fontSize={11}>
            Import more transactions to see trends
          </Text>
        </YStack>
      </GlassyCard>
    );
  }

  // Prepare chart data - sample every N points for readability
  const sampleRate = Math.max(1, Math.floor(history.history.length / 7));
  const sampledHistory = history.history.filter(
    (_, i) => i % sampleRate === 0 || i === history.history.length - 1,
  );

  // Safe date formatter
  const formatDateLabel = (date: Date | undefined | null): string => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const chartData = {
    labels: sampledHistory.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        data: sampledHistory.map((d) => d.balance),
        strokeWidth: 2,
      },
    ],
  };

  // Calculate trend (compare first vs last)
  const firstBalance = history.history[0]?.balance ?? 0;
  const lastBalance = history.history[history.history.length - 1]?.balance ?? 0;
  const trend = lastBalance - firstBalance;
  const trendPercent = firstBalance !== 0 ? (trend / Math.abs(firstBalance)) * 100 : 0;

  return (
    <GlassyCard marginBottom="$4">
      <YStack>
        {/* Header */}
        <XStack
          padding="$3"
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <YStack>
            <Text color="$secondaryText" fontSize={11} textTransform="uppercase">
              Balance Trend
            </Text>
            <Text color="$color" fontSize={18} fontWeight="bold">
              Last {days} Days
            </Text>
          </YStack>
          <YStack alignItems="flex-end">
            <XStack alignItems="center" gap="$1">
              <Text color={trend >= 0 ? "#22c55e" : "#ef4444"} fontSize={14} fontWeight="600">
                {trend >= 0 ? "+" : ""}
                {formatCurrency(trend)}
              </Text>
            </XStack>
            <Text color={trend >= 0 ? "#22c55e" : "#ef4444"} fontSize={11}>
              {trendPercent >= 0 ? "+" : ""}
              {trendPercent.toFixed(1)}%
            </Text>
          </YStack>
        </XStack>

        {/* Chart */}
        <YStack paddingVertical="$2">
          <LineChart
            data={chartData}
            width={screenWidth - 56}
            height={140}
            chartConfig={{
              backgroundColor: "transparent",
              backgroundGradientFrom: "transparent",
              backgroundGradientTo: "transparent",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(156, 163, 175, ${opacity})`,
              propsForDots: {
                r: "3",
                strokeWidth: "1",
                stroke: "#6366f1",
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: "rgba(156, 163, 175, 0.1)",
              },
            }}
            bezier
            style={{
              marginLeft: -8,
              paddingRight: 0,
            }}
            withInnerLines={true}
            withOuterLines={false}
            withVerticalLabels={true}
            withHorizontalLabels={true}
            fromZero={false}
          />
        </YStack>

        {/* Stats */}
        <XStack
          padding="$3"
          justifyContent="space-around"
          borderTopWidth={1}
          borderTopColor="$borderColor"
        >
          <YStack alignItems="center">
            <Text color="$secondaryText" fontSize={10} textTransform="uppercase">
              Highest
            </Text>
            <Text color="#22c55e" fontSize={14} fontWeight="600">
              {formatCurrency(history.highestBalance, true)}
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text color="$secondaryText" fontSize={10} textTransform="uppercase">
              Average
            </Text>
            <Text color="$color" fontSize={14} fontWeight="600">
              {formatCurrency(history.averageBalance, true)}
            </Text>
          </YStack>
          <YStack alignItems="center">
            <Text color="$secondaryText" fontSize={10} textTransform="uppercase">
              Lowest
            </Text>
            <Text color="#ef4444" fontSize={14} fontWeight="600">
              {formatCurrency(history.lowestBalance, true)}
            </Text>
          </YStack>
        </XStack>
      </YStack>
    </GlassyCard>
  );
}
