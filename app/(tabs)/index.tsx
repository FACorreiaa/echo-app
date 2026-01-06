import { CreditCard, Plus, Send, Settings, Sparkles } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, Text, XStack, YStack } from "tamagui";

import { AlertBell } from "@/components/AlertBell";
import { Avatar } from "@/components/Avatar";
import { BalanceHistoryChart } from "@/components/BalanceHistoryChart";
import { BentoCard, HookCard, InboxBadge, WhatIfSlider } from "@/components/bento";
import { GlassyCard } from "@/components/GlassyCard";
import { NetWorthCard } from "@/components/NetWorthCard";
import { PacingMeter } from "@/components/PacingMeter";
import { QuickCapture } from "@/components/QuickCapture";
import { useAccounts } from "@/lib/hooks/use-accounts";
import { useDashboardBlocks, useSpendingPulse } from "@/lib/hooks/use-insights";
import { useRecentTransactions } from "@/lib/hooks/use-transactions";
import { useAuthStore } from "@/lib/stores/auth-store";

// Format currency (moved outside component to avoid recreation)
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Get greeting based on time of day (moved outside component)
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// Map icon names to emojis for dashboard blocks
const getBlockEmoji = (icon: string) => {
  const iconMap: Record<string, string> = {
    "trending-up": "📈",
    "trending-down": "📉",
    "alert-triangle": "⚠️",
    "check-circle": "✅",
    coffee: "☕",
    "shopping-cart": "🛒",
    "credit-card": "💳",
    target: "🎯",
    calendar: "📅",
    zap: "⚡",
  };
  return iconMap[icon] || "💡";
};

const formatRelativeDate = (date: Date | undefined | null) => {
  // Defensive check for invalid dates
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

  // Fetch spending pulse data
  const { data: pulse, isLoading: pulseLoading } = useSpendingPulse();
  const { data: dashboardBlocks, isLoading: blocksLoading } = useDashboardBlocks();

  // Fetch accounts and transactions
  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: recentActivity = [], isLoading: activityLoading } = useRecentTransactions(5);

  // Quick Capture modal state
  const [showQuickCapture, setShowQuickCapture] = useState(false);

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 100 }}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <YStack>
            <Text color="$secondaryText" fontSize={14}>
              {getGreeting()}
            </Text>
            <Text color="$color" fontSize={24} fontWeight="bold">
              {user?.displayName || user?.username || user?.email?.split("@")[0] || "Welcome"}
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

        {/* Net Worth Card - Hero Section */}
        <NetWorthCard />

        {/* Spending Pace Meter */}
        {pulseLoading ? (
          <GlassyCard marginBottom="$4">
            <YStack padding="$4" alignItems="center">
              <ActivityIndicator />
            </YStack>
          </GlassyCard>
        ) : pulse ? (
          <YStack marginBottom="$4">
            <PacingMeter
              currentSpend={pulse.currentMonthSpend}
              lastMonthSpend={pulse.lastMonthSpend}
              pacePercent={pulse.pacePercent}
              isOverPace={pulse.isOverPace}
              dayOfMonth={pulse.dayOfMonth}
            />
          </YStack>
        ) : null}

        {/* Quick Actions */}
        <XStack justifyContent="space-around" marginBottom="$6">
          {[
            { icon: Send, label: "Send", onPress: () => {} },
            { icon: Plus, label: "Add", onPress: () => setShowQuickCapture(true) },
            { icon: CreditCard, label: "Card", onPress: () => {} },
            { icon: Sparkles, label: "Echo", onPress: () => router.push("/(tabs)/wrapped") },
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

        {/* Bento Insights Grid */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Insights
        </Text>
        <XStack gap="$3" marginBottom="$6" flexWrap="wrap">
          <BentoCard size="small" flex={1} minWidth={150}>
            <WhatIfSlider currentMonthlySpend={pulse?.currentMonthSpend ?? 1000} />
          </BentoCard>
          <BentoCard size="small" flex={1} minWidth={150}>
            <HookCard
              merchantName={dashboardBlocks?.[0]?.title ?? "Favorite Spot"}
              visitCount={8}
              totalSpent={(pulse?.currentMonthSpend ?? 0) * 0.15}
            />
          </BentoCard>
          <BentoCard size="small" flex={1} minWidth={150}>
            <InboxBadge count={0} onPress={() => router.push("/(tabs)/transactions")} />
          </BentoCard>
        </XStack>

        {/* Money Pulse */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Money Pulse
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          <XStack gap="$3">
            {blocksLoading ? (
              <GlassyCard width={160}>
                <YStack padding="$3" alignItems="center" justifyContent="center" height={100}>
                  <ActivityIndicator />
                </YStack>
              </GlassyCard>
            ) : dashboardBlocks && dashboardBlocks.length > 0 ? (
              dashboardBlocks.map((block, index) => (
                <GlassyCard key={index} width={160}>
                  <YStack padding="$3" gap="$2">
                    <YStack
                      backgroundColor={(block.color || "$accentColor") as any}
                      width={36}
                      height={36}
                      borderRadius={18}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize={18}>{getBlockEmoji(block.icon)}</Text>
                    </YStack>
                    <Text color="$color" fontSize={14} fontWeight="600">
                      {block.title}
                    </Text>
                    <Text color="$secondaryText" fontSize={12} numberOfLines={2}>
                      {block.subtitle || block.value}
                    </Text>
                  </YStack>
                </GlassyCard>
              ))
            ) : (
              <GlassyCard width={160}>
                <YStack padding="$3" gap="$2" alignItems="center">
                  <Text fontSize={18}>💡</Text>
                  <Text color="$secondaryText" fontSize={12} textAlign="center">
                    Import transactions to see insights
                  </Text>
                </YStack>
              </GlassyCard>
            )}
          </XStack>
        </ScrollView>

        {/* Balance History Chart */}
        <Text color="$color" fontSize={18} fontWeight="bold" marginBottom="$3">
          Balance Trend
        </Text>
        <BalanceHistoryChart days={30} />

        {/* Accounts */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
          <Text color="$color" fontSize={18} fontWeight="bold">
            Accounts
          </Text>
          <Text color="$accentColor" fontSize={14} onPress={() => {}}>
            See All
          </Text>
        </XStack>
        <YStack gap="$2" marginBottom="$6">
          {accountsLoading ? (
            <GlassyCard>
              <XStack padding="$3" alignItems="center" justifyContent="center">
                <ActivityIndicator />
              </XStack>
            </GlassyCard>
          ) : accounts.length === 0 ? (
            <GlassyCard>
              <YStack padding="$4" alignItems="center">
                <Text fontSize={24}>🏦</Text>
                <Text color="$secondaryText" marginTop="$2">
                  No accounts yet
                </Text>
              </YStack>
            </GlassyCard>
          ) : (
            accounts.map((account) => (
              <GlassyCard key={account.id}>
                <XStack padding="$3" alignItems="center" gap="$3">
                  <YStack
                    backgroundColor="$backgroundHover"
                    width={44}
                    height={44}
                    borderRadius={22}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={20}>{account.emoji}</Text>
                  </YStack>
                  <YStack flex={1}>
                    <Text color="$color" fontWeight="600">
                      {account.name}
                    </Text>
                    {account.lastFour && (
                      <Text color="$secondaryText" fontSize={12}>
                        ····{account.lastFour}
                      </Text>
                    )}
                  </YStack>
                  <Text color="$color" fontSize={16} fontWeight="bold">
                    {formatCurrency(account.balance / 100)}
                  </Text>
                </XStack>
              </GlassyCard>
            ))
          )}
        </YStack>

        {/* Recent Activity */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$3">
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
                <Text color="$secondaryText" marginTop="$2">
                  No recent transactions
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

      {/* Quick Capture Modal */}
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
    </YStack>
  );
}
