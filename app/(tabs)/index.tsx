import { CreditCard, Plus, Settings, Sparkles, TrendingUp } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";

import { AlertBell, Avatar, HUDCard, ScanLine, GridBackground } from "@/components";
import { QuickCapture } from "@/components";
import { useSetOpeningBalance } from "@/lib/hooks/use-balance";
import { useDashboardBlocks } from "@/lib/hooks/use-insights";
import { useSystemHealth } from "@/lib/hooks/use-system-health";
import { useRecentTransactions } from "@/lib/hooks/use-transactions";
import { useAuthStore } from "@/lib/stores/auth-store";

// Lazy load heavy widgets for better initial load time
const SystemHealthScoreCard = lazy(() =>
  import("@/widgets/insights/SystemHealthScoreCard").then((m) => ({
    default: m.SystemHealthScoreCard,
  })),
);

const DailyAllowanceWidget = lazy(() =>
  import("@/widgets/insights/DailyAllowanceWidget").then((m) => ({
    default: m.DailyAllowanceWidget,
  })),
);

const PacingMeter = lazy(() =>
  import("@/widgets/insights/PacingMeter").then((m) => ({ default: m.PacingMeter })),
);

const InsightSummaryCard = lazy(() =>
  import("@/widgets/insights/InsightSummaryCard").then((m) => ({
    default: m.InsightSummaryCard,
  })),
);

const BalanceHistoryChart = lazy(() =>
  import("@/components").then((m) => ({ default: m.BalanceHistoryChart })),
);

const NetWorthCard = lazy(() => import("@/components").then((m) => ({ default: m.NetWorthCard })));

const BentoCard = lazy(() => import("@/widgets/bento").then((m) => ({ default: m.BentoCard })));

const HookCard = lazy(() => import("@/widgets/bento").then((m) => ({ default: m.HookCard })));

const WhatIfSlider = lazy(() =>
  import("@/widgets/bento").then((m) => ({ default: m.WhatIfSlider })),
);

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
  const { totalBudgeted, totalSpent, daysElapsed, daysTotal } = useSystemHealth();
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentTransactions(5);
  const { data: dashboardBlocks } = useDashboardBlocks();

  // Local State
  const [showQuickCapture, setShowQuickCapture] = useState(false);
  const [showNetWorthSheet, setShowNetWorthSheet] = useState(false);
  const [netWorthAmount, setNetWorthAmount] = useState("");
  const setOpeningBalance = useSetOpeningBalance();

  // Memoized handlers for quick actions
  const handleNetWorth = useCallback(() => setShowNetWorthSheet(true), []);
  const handleQuickCapture = useCallback(() => setShowQuickCapture(true), []);
  const handleWrapped = useCallback(() => router.push("/(tabs)/wrapped"), [router]);

  const quickActions = useMemo(
    () => [
      { icon: TrendingUp, label: "Net Worth", onPress: handleNetWorth },
      { icon: Plus, label: "Add", onPress: handleQuickCapture },
      { icon: CreditCard, label: "Card", onPress: () => {} },
      { icon: Sparkles, label: "Wrappd", onPress: handleWrapped },
    ],
    [handleNetWorth, handleQuickCapture, handleWrapped],
  );

  return (
    <YStack flex={1} backgroundColor="$hudFoundation" paddingTop={insets.top}>
      <GridBackground gridSize={20} opacity={0.08} />
      <ScanLine height={1200} duration={6000} opacity={0.06} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}>
        {/* HEADER - TACTICAL OS STYLE */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <YStack>
            <Text color="$hudActive" fontSize={10} fontWeight="bold" letterSpacing={1.5}>
              {getGreeting().toUpperCase()}
            </Text>
            <Text color="$color" fontSize={24} fontWeight="bold" letterSpacing={0.5}>
              {user?.displayName || user?.username || "COMMANDER"}
            </Text>
          </YStack>
          <XStack gap="$2">
            <AlertBell size={20} />
            <Button
              size="$3"
              circular
              backgroundColor="$hudDepth"
              borderWidth={1}
              borderColor="$hudBorder"
              icon={<Settings size={20} color="$hudActive" />}
              onPress={() => router.push("/(tabs)/settings")}
            />
          </XStack>
        </XStack>

        {/* COMMAND CENTER - HERO AREA */}
        <Suspense
          fallback={
            <YStack padding="$4" alignItems="center">
              <Spinner size="large" color="$accentColor" />
            </YStack>
          }
        >
          <SystemHealthScoreCard />
        </Suspense>

        <XStack gap="$3" marginBottom="$4">
          {/* Left Column: Daily Allowance */}
          <YStack flex={1}>
            <Suspense
              fallback={
                <YStack padding="$4" alignItems="center">
                  <Spinner size="small" color="$accentColor" />
                </YStack>
              }
            >
              <DailyAllowanceWidget />
            </Suspense>
          </YStack>
        </XStack>

        {/* PACING & INSIGHTS */}
        <YStack gap="$4" marginBottom="$6">
          <Suspense
            fallback={
              <YStack padding="$4" alignItems="center">
                <Spinner size="small" color="$accentColor" />
              </YStack>
            }
          >
            <PacingMeter
              monthlyBudget={totalBudgeted}
              currentSpend={totalSpent}
              daysElapsed={daysElapsed}
              daysTotal={daysTotal}
            />
          </Suspense>

          <Suspense
            fallback={
              <YStack padding="$4" alignItems="center">
                <Spinner size="small" color="$accentColor" />
              </YStack>
            }
          >
            <InsightSummaryCard />
          </Suspense>
        </YStack>

        {/* BENTO GRID (Keep relevant quick actions?) */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Quick Actions
        </Text>
        <XStack justifyContent="space-around" marginBottom="$6">
          {quickActions.map((action) => (
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
        <Suspense
          fallback={
            <YStack padding="$4" alignItems="center">
              <Spinner size="small" color="$accentColor" />
            </YStack>
          }
        >
          <NetWorthCard />
        </Suspense>

        {/* Use existing BentoCards if useful */}
        <Suspense
          fallback={
            <YStack padding="$4" alignItems="center">
              <Spinner size="small" color="$accentColor" />
            </YStack>
          }
        >
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
        </Suspense>

        {/* BALANCE HISTORY */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Balance Trend
        </Text>
        <Suspense
          fallback={
            <YStack padding="$4" alignItems="center">
              <Spinner size="small" color="$accentColor" />
            </YStack>
          }
        >
          <BalanceHistoryChart days={30} />
        </Suspense>

        {/* RECENT ACTIVITY - TACTICAL DATA LOG */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3" marginTop="$6">
          <Text color="$color" fontSize={16} fontWeight="bold" letterSpacing={0.5}>
            DATA LOG
          </Text>
          <Text
            color="$hudActive"
            fontSize={12}
            fontWeight="bold"
            letterSpacing={0.5}
            onPress={() => router.push("/(tabs)/transactions")}
          >
            VIEW ALL
          </Text>
        </XStack>
        <HUDCard>
          <YStack>
            {activityLoading ? (
              <XStack padding="$4" justifyContent="center">
                <ActivityIndicator />
              </XStack>
            ) : recentActivity.length === 0 ? (
              <YStack padding="$4" alignItems="center">
                <Text fontSize={24}>📋</Text>
                <Text color="$secondaryText" letterSpacing={0.5}>
                  NO DATA ENTRIES
                </Text>
              </YStack>
            ) : (
              recentActivity.map((tx, index) => (
                <XStack
                  key={tx.id}
                  padding="$3"
                  alignItems="center"
                  gap="$3"
                  borderBottomWidth={index < recentActivity.length - 1 ? 1 : 0}
                  borderBottomColor="$hudBorder"
                >
                  <Avatar name={tx.name} size="md" />
                  <YStack flex={1}>
                    <Text color="$color" fontWeight="600" fontSize={14}>
                      {tx.name.toUpperCase()}
                    </Text>
                    <Text color="$secondaryText" fontSize={11} letterSpacing={0.5}>
                      {formatRelativeDate(tx.date)?.toUpperCase()}
                    </Text>
                  </YStack>
                  <Text
                    color={tx.amount < 0 ? "$hudActive" : "$healthGood"}
                    fontSize={15}
                    fontWeight="700"
                    letterSpacing={0.5}
                  >
                    {tx.amount < 0 ? "-" : "+"}
                    {formatCurrency(Math.abs(tx.amount) / 100)}
                  </Text>
                </XStack>
              ))
            )}
          </YStack>
        </HUDCard>
      </ScrollView>

      {/* MODALS - Conditionally mounted for better memory management */}
      {showQuickCapture && (
        <Modal
          visible
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
      )}

      {showNetWorthSheet && (
        <Modal
          visible
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
      )}
    </YStack>
  );
}
