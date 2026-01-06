/**
 * NetWorthCard - Hero card showing total net worth with balance breakdown
 *
 * Features:
 * - Total net worth display
 * - Cash vs Investment breakdown
 * - Safe-to-spend amount
 * - "Based on CSV estimate" indicator
 * - 24h change indicator
 */

import { AlertCircle, Shield, TrendingDown, TrendingUp, Wallet } from "@tamagui/lucide-icons";
import React from "react";
import { ActivityIndicator } from "react-native";
import { Progress, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import { useBalance } from "@/lib/hooks/use-balance";

// Format currency
const formatCurrency = (amount: number, currency = "EUR") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format change percentage
const formatPercent = (value: number) => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

interface NetWorthCardProps {
  accountId?: string;
}

export function NetWorthCard({ accountId }: NetWorthCardProps) {
  const { data: balance, isLoading, isError } = useBalance(accountId);

  if (isLoading) {
    return (
      <GlassyCard marginBottom="$4">
        <YStack padding="$6" alignItems="center" justifyContent="center" height={200}>
          <ActivityIndicator size="large" />
          <Text color="$secondaryText" marginTop="$3">
            Calculating your balance...
          </Text>
        </YStack>
      </GlassyCard>
    );
  }

  if (isError || !balance) {
    return (
      <GlassyCard marginBottom="$4">
        <YStack padding="$4" alignItems="center">
          <AlertCircle size={32} color="$red10" />
          <Text color="$secondaryText" marginTop="$2">
            Unable to load balance
          </Text>
        </YStack>
      </GlassyCard>
    );
  }

  const { totalNetWorth, safeToSpend, totalInvestments, currencyCode, isEstimated } = balance;
  const totalCash = totalNetWorth - totalInvestments;

  // Calculate percentages for the breakdown bar
  const cashPercent = totalNetWorth > 0 ? (totalCash / totalNetWorth) * 100 : 50;

  // Calculate 24h change from accounts
  const total24hChange = balance.accounts.reduce(
    (sum, acc) => sum + (acc.change24h?.amountMinor ? Number(acc.change24h.amountMinor) / 100 : 0),
    0,
  );
  const changePercent = totalNetWorth > 0 ? (total24hChange / totalNetWorth) * 100 : 0;

  return (
    <GlassyCard marginBottom="$4">
      <YStack padding="$4" gap="$3">
        {/* CSV Estimate Indicator */}
        {isEstimated && (
          <XStack
            backgroundColor="rgba(251, 191, 36, 0.15)"
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius="$2"
            alignSelf="flex-start"
          >
            <Text color="#fbbf24" fontSize={10} fontWeight="600">
              📊 Based on CSV import
            </Text>
          </XStack>
        )}

        {/* Net Worth Header */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack>
            <Text color="$secondaryText" fontSize={12} textTransform="uppercase">
              Net Worth
            </Text>
            <Text color="$color" fontSize={40} fontWeight="bold" letterSpacing={-1}>
              {formatCurrency(totalNetWorth, currencyCode)}
            </Text>
          </YStack>

          {/* 24h Change Badge */}
          {total24hChange !== 0 && (
            <XStack
              backgroundColor={
                total24hChange >= 0 ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)"
              }
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$2"
              alignItems="center"
              gap="$1"
            >
              {total24hChange >= 0 ? (
                <TrendingUp size={14} color="#22c55e" />
              ) : (
                <TrendingDown size={14} color="#ef4444" />
              )}
              <Text
                color={total24hChange >= 0 ? "#22c55e" : "#ef4444"}
                fontSize={12}
                fontWeight="600"
              >
                {formatCurrency(Math.abs(total24hChange), currencyCode)} (
                {formatPercent(changePercent)})
              </Text>
            </XStack>
          )}
        </XStack>

        {/* Balance Breakdown Bar */}
        <YStack gap="$2">
          <Progress
            value={cashPercent}
            backgroundColor="$backgroundHover"
            height={8}
            borderRadius={4}
          >
            <Progress.Indicator
              animation="bouncy"
              backgroundColor="$accentColor"
              borderRadius={4}
            />
          </Progress>

          <XStack justifyContent="space-between">
            <XStack alignItems="center" gap="$2">
              <YStack backgroundColor="$accentColor" width={8} height={8} borderRadius={4} />
              <Text color="$secondaryText" fontSize={12}>
                Cash: {formatCurrency(totalCash, currencyCode)}
              </Text>
            </XStack>
            <XStack alignItems="center" gap="$2">
              <YStack backgroundColor="$backgroundHover" width={8} height={8} borderRadius={4} />
              <Text color="$secondaryText" fontSize={12}>
                Investments: {formatCurrency(totalInvestments, currencyCode)}
              </Text>
            </XStack>
          </XStack>
        </YStack>

        {/* Safe to Spend */}
        <XStack
          backgroundColor="rgba(34, 197, 94, 0.1)"
          padding="$3"
          borderRadius="$3"
          alignItems="center"
          gap="$3"
        >
          <YStack
            backgroundColor="rgba(34, 197, 94, 0.2)"
            width={40}
            height={40}
            borderRadius={20}
            alignItems="center"
            justifyContent="center"
          >
            <Shield size={20} color="#22c55e" />
          </YStack>
          <YStack flex={1}>
            <Text color="$secondaryText" fontSize={11} textTransform="uppercase">
              Safe to Spend
            </Text>
            <Text color="#22c55e" fontSize={24} fontWeight="bold">
              {formatCurrency(safeToSpend, currencyCode)}
            </Text>
          </YStack>
          <YStack alignItems="flex-end">
            <Text color="$secondaryText" fontSize={10}>
              After upcoming bills
            </Text>
            <Text color="$secondaryText" fontSize={12} fontWeight="600">
              -{formatCurrency(balance.upcomingBills, currencyCode)}
            </Text>
          </YStack>
        </XStack>

        {/* Account Summary */}
        {balance.accounts.length > 0 && (
          <XStack justifyContent="space-around" paddingTop="$2">
            {balance.accounts.slice(0, 3).map((account) => (
              <YStack key={account.accountId} alignItems="center" gap="$1">
                <YStack
                  backgroundColor="$backgroundHover"
                  width={36}
                  height={36}
                  borderRadius={18}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Wallet size={18} color="$color" />
                </YStack>
                <Text color="$color" fontSize={12} fontWeight="600">
                  {formatCurrency(
                    (account.cashBalance ? Number(account.cashBalance.amountMinor) / 100 : 0) +
                      (account.investmentBalance
                        ? Number(account.investmentBalance.amountMinor) / 100
                        : 0),
                    currencyCode,
                  )}
                </Text>
                <Text color="$secondaryText" fontSize={10} numberOfLines={1}>
                  {account.accountName}
                </Text>
              </YStack>
            ))}
          </XStack>
        )}
      </YStack>
    </GlassyCard>
  );
}
