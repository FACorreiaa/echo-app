import { CreditCard, Plus, Settings, Sparkles, TrendingUp } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";

import { AlertBell, Avatar, BalanceHistoryChart, GlassyCard, NetWorthCard } from "@/components";
import { DailyAllowanceWidget } from "@/widgets/insights/DailyAllowanceWidget";
import { InsightSummaryCard } from "@/widgets/insights/InsightSummaryCard";
import { PacingMeter } from "@/widgets/insights/PacingMeter";
import { SystemHealthScoreCard } from "@/widgets/insights/SystemHealthScoreCard";

import { QuickCapture } from "@/components";
import { useAccounts } from "@/lib/hooks/use-accounts";
import { useSetOpeningBalance } from "@/lib/hooks/use-balance";
import {
  useDashboardBlocks,
  useSpendingPulse as useSpendingPulseHook,
} from "@/lib/hooks/use-insights"; // Retaining for Bento/Blocks if needed
import { useSystemHealth } from "@/lib/hooks/use-system-health";
import { useRecentTransactions } from "@/lib/hooks/use-transactions";
import { useAuthStore } from "@/lib/stores/auth-store";
import { BentoCard, HookCard, WhatIfSlider } from "@/widgets/bento";

// Format currency helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Greeting helper
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Date formatter
const formatRelativeDate = (date: Date | undefined | null) => {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return "Unknown";
  }
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  // Data Hooks
  const {
    totalBudgeted,
    totalSpent,
    daysElapsed,
    daysTotal,
    isLoading: _healthLoading,
  } = useSystemHealth();

  const { data: _accounts = [], isLoading: _accountsLoading } = useAccounts();
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentTransactions(5);
  // Optional: Pulse data for Bento if we want to keep it driven by real transaction insights
  const { data: _pulse } = useSpendingPulseHook();
  const { data: dashboardBlocks } = useDashboardBlocks();

  // Local State
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [showNetWorthSheet, setShowNetWorthSheet] = useState(false);
  const [netWorthAmount, setNetWorthAmount] = useState("");
  const setOpeningBalance = useSetOpeningBalance();

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}>
        {/* HEADER */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <YStack>
            <Text color="$secondaryText" fontSize={14}>
              {getGreeting()}
            </Text>
            <Text color="$color" fontSize={24} fontWeight="bold">
              {user?.displayName || user?.username || "Welcome"}
            </Text>
          </YStack>
          <XStack gap="$2">
            <AlertBell size={20} />
            <Button
              size="$3"
              circular
              backgroundColor="$backgroundHover"
              icon={<Settings size={20} color="$color" />}
              onPress={() => router.push("/(tabs)/settings")}
            />
          </XStack>
        </XStack>

        {/* COMMAND CENTER - HERO AREA */}
        <SystemHealthScoreCard />

        <XStack gap="$3" marginBottom="$4">
          {/* Left Column: Daily Allowance */}
          <YStack flex={1}>
            <DailyAllowanceWidget />
          </YStack>
        </XStack>

        {/* PACING & INSIGHTS */}
        <YStack gap="$4" marginBottom="$6">
          <PacingMeter
            monthlyBudget={totalBudgeted}
            currentSpend={totalSpent}
            daysElapsed={daysElapsed}
            daysTotal={daysTotal}
          />

          <InsightSummaryCard />
        </YStack>

        {/* BENTO GRID (Keep relevant quick actions?) */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Quick Actions
        </Text>
        <XStack justifyContent="space-around" marginBottom="$6">
          {[
            { icon: TrendingUp, label: "Net Worth", onPress: () => setShowNetWorthSheet(true) },
            { icon: Plus, label: "Add", onPress: () => setShowQuickCapture(true) },
            { icon: CreditCard, label: "Card", onPress: () => {} },
            { icon: Sparkles, label: "Wrappd", onPress: () => router.push("/(tabs)/wrapped") },
          ].map((action) => (
            <YStack key={action.label} alignItems="center" gap="$2">
              <Button
                size="$4"
                circular
                backgroundColor="$backgroundHover"
                icon={<action.icon size={22} color="$color" />}
                onPress={action.onPress}
              />
              <Text color="$secondaryText" fontSize={12}>
                {action.label}
              </Text>
            </YStack>
          ))}
        </XStack>

        {/* NET WORTH & TRENDS */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Financial Overview
        </Text>
        <NetWorthCard />

        {/* Use existing BentoCards if useful */}
        <XStack gap="$3" marginTop="$4" marginBottom="$6" flexWrap="wrap">
          <BentoCard size="small" flex={1} minWidth={150}>
            <WhatIfSlider currentMonthlySpend={totalSpent || 1000} />
          </BentoCard>
          <BentoCard size="small" flex={1} minWidth={150}>
            {/* Reuse pulse data if available for HookCard */}
            <HookCard
              merchantName={dashboardBlocks?.[0]?.title ?? "Top Spot"}
              visitCount={5}
              totalSpent={totalSpent * 0.15}
            />
          </BentoCard>
        </XStack>

        {/* BALANCE HISTORY */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Balance Trend
        </Text>
        <BalanceHistoryChart days={30} />

        {/* RECENT ACTIVITY */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3" marginTop="$6">
          <Text color="$color" fontSize={18} fontWeight="bold">
            Recent Activity
          </Text>
          <Text
            color="$accentColor"
            fontSize={14}
            onPress={() => router.push("/(tabs)/transactions")}
          >
            See All
          </Text>
        </XStack>
        <GlassyCard>
          <YStack>
            {activityLoading ? (
              <XStack padding="$4" justifyContent="center">
                <ActivityIndicator />
              </XStack>
            ) : recentActivity.length === 0 ? (
              <YStack padding="$4" alignItems="center">
                <Text fontSize={24}>📋</Text>
                <Text color="$secondaryText">No recent transactions</Text>
              </YStack>
            ) : (
              recentActivity.map((tx, index) => (
                <XStack
                  key={tx.id}
                  padding="$3"
                  alignItems="center"
                  gap="$3"
                  borderBottomWidth={index < recentActivity.length - 1 ? 1 : 0}
                  borderBottomColor="$borderColor"
                >
                  <Avatar name={tx.name} size="md" />
                  <YStack flex={1}>
                    <Text color="$color" fontWeight="600">
                      {tx.name}
                    </Text>
                    <Text color="$secondaryText" fontSize={12}>
                      {formatRelativeDate(tx.date)}
                    </Text>
                  </YStack>
                  <Text color={tx.amount < 0 ? "$color" : "#22c55e"} fontSize={16} fontWeight="600">
                    {tx.amount < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(tx.amount) / 100)}
                  </Text>
                </XStack>
              ))
            )}
          </YStack>
        </GlassyCard>
      </ScrollView>

      {/* MODALS */}
      <Modal
        visible={showQuickCapture}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuickCapture(false)}
      >
        <YStack flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="center" padding="$4">
          <QuickCapture
            onSuccess={() => setShowQuickCapture(false)}
            onClose={() => setShowQuickCapture(false)}
          />
        </YStack>
      </Modal>

      <Modal
        visible={showNetWorthSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNetWorthSheet(false)}
      >
        <YStack flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
          <YStack
            backgroundColor="$background"
            padding="$5"
            borderTopLeftRadius={24}
            borderTopRightRadius={24}
            gap="$4"
          >
            <XStack justifyContent="space-between" alignItems="center">
              <Text color="$color" fontSize={20} fontWeight="bold">
                📈 Add to Net Worth
              </Text>
              <Button size="$3" circular chromeless onPress={() => setShowNetWorthSheet(false)}>
                ✕
              </Button>
            </XStack>
            <Text color="$secondaryText" fontSize={14}>
              Enter the amount to add to your tracked net worth
            </Text>
            <XStack alignItems="center" gap="$2">
              <Text color="$color" fontSize={32} fontWeight="bold">
                €
              </Text>
              <YStack flex={1}>
                <Text color="$secondaryText" fontSize={12}>
                  Amount
                </Text>
                <XStack
                  backgroundColor="$backgroundHover"
                  borderRadius="$4"
                  padding="$3"
                  alignItems="center"
                >
                  <Text
                    color={netWorthAmount ? "$color" : "$secondaryText"}
                    fontSize={24}
                    fontWeight="bold"
                    flex={1}
                  >
                    {netWorthAmount || "0"}
                  </Text>
                </XStack>
              </YStack>
            </XStack>
            <YStack gap="$2">
              {[
                ["1", "2", "3"],
                ["4", "5", "6"],
                ["7", "8", "9"],
                [".", "0", "⌫"],
              ].map((row, i) => (
                <XStack key={i} gap="$2" justifyContent="center">
                  {row.map((key) => (
                    <Button
                      key={key}
                      size="$5"
                      flex={1}
                      backgroundColor="$backgroundHover"
                      onPress={() => {
                        if (key === "⌫") setNetWorthAmount((prev) => prev.slice(0, -1));
                        else if (key === "." && netWorthAmount.includes(".")) {
                        } else setNetWorthAmount((prev) => prev + key);
                      }}
                    >
                      <Text color="$color" fontSize={20}>
                        {key}
                      </Text>
                    </Button>
                  ))}
                </XStack>
              ))}
            </YStack>
            <Button
              size="$5"
              backgroundColor={setOpeningBalance.isPending ? "$backgroundHover" : "#22c55e"}
              color="white"
              fontWeight="bold"
              onPress={() => {
                const amountInCents = Math.round(parseFloat(netWorthAmount) * 100);
                setOpeningBalance.mutate(
                  { amountMinor: amountInCents },
                  {
                    onSuccess: () => {
                      setShowNetWorthSheet(false);
                      setNetWorthAmount("");
                    },
                  },
                );
              }}
              disabled={
                !netWorthAmount || parseFloat(netWorthAmount) <= 0 || setOpeningBalance.isPending
              }
            >
              {setOpeningBalance.isPending
                ? "Adding..."
                : `Add €${netWorthAmount || "0"} to Net Worth`}
            </Button>
          </YStack>
        </YStack>
      </Modal>
    </YStack>
  );
}
