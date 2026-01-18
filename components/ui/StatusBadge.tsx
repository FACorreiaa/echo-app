/**
 * StatusBadge - Budget Health Indicator
 *
 * Displays budget status with color-coded badges like Copilot Money.
 * Shows amount over/under budget with appropriate color coding.
 *
 * @example
 * <StatusBadge value={125} type="under" currency="EUR" />
 * <StatusBadge value={50} type="over" currency="EUR" />
 */

import React from "react";
import { Text, XStack } from "tamagui";

interface StatusBadgeProps {
  value: number;
  type: "under" | "over" | "on-track" | "warning";
  currency?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  value,
  type,
  currency = "EUR",
  size = "md",
  showLabel = true,
}) => {
  const currencySymbol = currency === "EUR" ? "€" : currency === "USD" ? "$" : currency;

  const configs = {
    under: {
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.15)",
      label: "under",
      icon: "✓",
    },
    over: {
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.15)",
      label: "over",
      icon: "!",
    },
    "on-track": {
      color: "#2DA6FA",
      bgColor: "rgba(45, 166, 250, 0.15)",
      label: "on track",
      icon: "→",
    },
    warning: {
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.15)",
      label: "warning",
      icon: "⚠",
    },
  };

  const config = configs[type];

  const sizes = {
    sm: { height: 20, paddingX: 8, fontSize: 10 },
    md: { height: 24, paddingX: 10, fontSize: 11 },
    lg: { height: 28, paddingX: 12, fontSize: 13 },
  };

  const { height, paddingX, fontSize } = sizes[size];

  const formattedValue = Math.abs(value).toFixed(2);

  return (
    <XStack
      height={height}
      paddingHorizontal={paddingX}
      borderRadius={4}
      backgroundColor={config.bgColor as any}
      alignItems="center"
      gap={4}
    >
      <Text color={config.color as any} fontSize={fontSize} fontWeight="700" letterSpacing={0.5}>
        {currencySymbol}
        {formattedValue}
        {showLabel && ` ${config.label}`}
      </Text>
    </XStack>
  );
};

/**
 * BudgetHealthIndicator - Shows budget status with percentage
 */
interface BudgetHealthIndicatorProps {
  spent: number;
  budgeted: number;
  currency?: string;
}

export const BudgetHealthIndicator: React.FC<BudgetHealthIndicatorProps> = ({
  spent,
  budgeted,
  currency = "EUR",
}) => {
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const remaining = budgeted - spent;

  let type: "under" | "over" | "on-track" | "warning" = "on-track";
  if (percentage >= 100) {
    type = "over";
  } else if (percentage >= 90) {
    type = "warning";
  } else if (percentage < 90) {
    type = "under";
  }

  return (
    <XStack gap={8} alignItems="center">
      <StatusBadge value={Math.abs(remaining)} type={type} currency={currency} showLabel={false} />
      <Text color="$secondaryText" fontSize={11} letterSpacing={0.5}>
        {percentage.toFixed(0)}% USED
      </Text>
    </XStack>
  );
};

/**
 * PacingIndicator - Shows if spending is ahead/behind pace
 */
interface PacingIndicatorProps {
  currentSpend: number;
  expectedSpend: number;
  currency?: string;
}

export const PacingIndicator: React.FC<PacingIndicatorProps> = ({
  currentSpend,
  expectedSpend,
  currency = "EUR",
}) => {
  const difference = expectedSpend - currentSpend;
  const type = difference >= 0 ? "under" : "over";

  return (
    <StatusBadge
      value={Math.abs(difference)}
      type={type}
      currency={currency}
      size="md"
      showLabel={true}
    />
  );
};
