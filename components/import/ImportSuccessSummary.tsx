import { ArrowUpRight, Calendar, Check, Layers, Shield } from "@tamagui/lucide-icons";
import React from "react";
import { Button, Circle, H3, Separator, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";

interface ImportSuccessSummaryProps {
  /** Number of transactions imported */
  count: number;
  /** Total transaction volume in minor units (cents) */
  totalMinor: number;
  /** Number of duplicates blocked */
  duplicates?: number;
  /** Currency code */
  currency?: string;
  /** Start date of the imported transactions */
  startDate?: Date;
  /** End date of the imported transactions */
  endDate?: Date;
  /** Callback when user taps "Go to Dashboard" */
  onDone: () => void;
  /** Optional: route to planning instead of dashboard */
  isPlanningImport?: boolean;
}

const formatCurrency = (minorUnits: number, currency = "EUR") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(minorUnits / 100);
};

const formatDate = (d: Date) =>
  d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

const formatDateRange = (start?: Date, end?: Date) => {
  if (!start || !end) return "Last 3 months";

  return `${formatDate(start)} - ${formatDate(end)}`;
};

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}

const StatRow = ({ icon, label, value, valueColor = "$color" }: StatRowProps) => (
  <XStack justifyContent="space-between" alignItems="center">
    <XStack gap="$3" alignItems="center">
      {icon}
      <Text color="$secondaryText">{label}</Text>
    </XStack>
    <Text fontWeight="bold" color={valueColor as any}>
      {value}
    </Text>
  </XStack>
);

/**
 * ImportSuccessSummary - A "Wrapped" style success card.
 * Shows transaction stats after a successful import.
 */
export const ImportSuccessSummary = ({
  count,
  totalMinor,
  duplicates = 0,
  currency = "EUR",
  startDate,
  endDate,
  onDone,
  isPlanningImport = false,
}: ImportSuccessSummaryProps) => {
  return (
    <YStack flex={1} padding="$4" gap="$6" justifyContent="center">
      {/* Success Hero Section */}
      <YStack alignItems="center" gap="$2">
        <Circle
          size={80}
          backgroundColor="rgba(34, 197, 94, 0.15)"
          borderWidth={2}
          borderColor="#22c55e"
          alignItems="center"
          justifyContent="center"
        >
          <Check size={40} color="#22c55e" />
        </Circle>
        <H3 textAlign="center" color="$color">
          Import Complete!
        </H3>
        <Text color="$secondaryText" textAlign="center">
          Echo has successfully mapped your financial story.
        </Text>
      </YStack>

      {/* Stats Bento Card */}
      <GlassyCard>
        <YStack gap="$4" padding="$2">
          <StatRow
            icon={<Layers size={20} color="gray" />}
            label="Transactions Found"
            value={count.toLocaleString()}
          />
          <Separator />
          <StatRow
            icon={<ArrowUpRight size={20} color="$blue10" />}
            label="Total Volume"
            value={formatCurrency(totalMinor, currency)}
            valueColor="$blue10"
          />
          <Separator />
          <StatRow
            icon={<Calendar size={20} color="gray" />}
            label="Date Range"
            value={formatDateRange(startDate, endDate)}
          />
        </YStack>
      </GlassyCard>

      {/* Smart Insight Note - Duplicates blocked */}
      {duplicates > 0 && (
        <XStack
          backgroundColor="rgba(234, 179, 8, 0.15)"
          padding="$3"
          borderRadius="$4"
          gap="$3"
          alignItems="center"
        >
          <Shield size={20} color="#eab308" />
          <Text fontSize="$3" color="#eab308" flex={1}>
            Echo automatically ignored <Text fontWeight="bold">{duplicates} duplicate</Text> entries
            to keep your balance accurate.
          </Text>
        </XStack>
      )}

      {/* Call to Action */}
      <Button
        size="$5"
        fontWeight="bold"
        onPress={onDone}
        backgroundColor="$accentColor"
        color="white"
        iconAfter={<ArrowUpRight size={18} color="white" />}
      >
        {isPlanningImport ? "View Plan" : "Go to Dashboard"}
      </Button>
    </YStack>
  );
};

export default ImportSuccessSummary;
