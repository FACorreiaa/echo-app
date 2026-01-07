/**
 * MonthlyInsightsCard - Displays "3 things that changed" + "1 action to take"
 *
 * Features:
 * - Shows top 3 changes this month (category changes, new merchants, income changes)
 * - Displays 1 prioritized action recommendation
 * - Visual indicators for trends (up/down/stable)
 * - Tap to drill down for more details
 */

import {
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronRight,
  MinusCircle,
  Store,
  TrendingDown,
  TrendingUp,
} from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import { Separator, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { MonthlyInsight, RecommendedAction } from "@/lib/hooks/use-insights";

interface MonthlyInsightsCardProps {
  month: string;
  thingsChanged: MonthlyInsight[];
  recommendedAction: RecommendedAction | null;
  isLoading?: boolean;
  onInsightPress?: (insight: MonthlyInsight) => void;
  onActionPress?: (action: RecommendedAction) => void;
}

// Helper to format month
const formatMonth = (monthStr: string) => {
  const date = new Date(monthStr + "-01");
  return date.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
};

// Helper to get trend icon and color
const getTrendIcon = (trend: "up" | "down" | "stable", size = 16) => {
  switch (trend) {
    case "up":
      return <TrendingUp size={size} color="#ef4444" />;
    case "down":
      return <TrendingDown size={size} color="#22c55e" />;
    default:
      return <MinusCircle size={size} color="#6b7280" />;
  }
};

// Insight row component
interface InsightRowProps {
  insight: MonthlyInsight;
  onPress?: () => void;
}

const InsightRow = ({ insight, onPress }: InsightRowProps) => {
  const renderIcon = () => {
    switch (insight.type) {
      case "category_change":
        return insight.categoryChange ? getTrendIcon(insight.categoryChange.trend, 20) : null;
      case "new_merchant":
        return <Store size={20} color="#2da6fa" />;
      case "income_change":
        return insight.incomeChange ? getTrendIcon(insight.incomeChange.trend, 20) : null;
      default:
        return <AlertCircle size={20} color="#6b7280" />;
    }
  };

  return (
    <Pressable onPress={onPress}>
      <XStack paddingVertical="$3" gap="$3" alignItems="center" pressStyle={{ opacity: 0.7 }}>
        <YStack
          width={40}
          height={40}
          borderRadius={20}
          backgroundColor="$backgroundHover"
          alignItems="center"
          justifyContent="center"
        >
          {renderIcon()}
        </YStack>

        <YStack flex={1} gap="$1">
          <Text color="$color" fontWeight="600" fontSize={14}>
            {insight.title}
          </Text>
          <Text color="$secondaryText" fontSize={12} numberOfLines={2}>
            {insight.description}
          </Text>
        </YStack>

        <ChevronRight size={18} color="$secondaryText" />
      </XStack>
    </Pressable>
  );
};

// Action card component
interface ActionCardProps {
  action: RecommendedAction;
  onPress?: () => void;
}

const ActionCard = ({ action, onPress }: ActionCardProps) => {
  const getActionIcon = () => {
    switch (action.actionType) {
      case "uncategorized":
        return <AlertCircle size={24} color="#f59e0b" />;
      case "high_spending":
        return <ArrowUpCircle size={24} color="#ef4444" />;
      default:
        return <ArrowDownCircle size={24} color="#2da6fa" />;
    }
  };

  const getActionColor = () => {
    switch (action.actionType) {
      case "uncategorized":
        return "#f59e0b";
      case "high_spending":
        return "#ef4444";
      default:
        return "#2da6fa";
    }
  };

  return (
    <Pressable onPress={onPress}>
      <XStack
        backgroundColor="$backgroundHover"
        padding="$4"
        borderRadius="$4"
        gap="$3"
        alignItems="center"
        pressStyle={{ opacity: 0.7 }}
      >
        <YStack
          width={48}
          height={48}
          borderRadius={24}
          backgroundColor={`${getActionColor()}20`}
          alignItems="center"
          justifyContent="center"
        >
          {getActionIcon()}
        </YStack>

        <YStack flex={1} gap="$1">
          <Text
            color={getActionColor() as any}
            fontWeight="bold"
            fontSize={12}
            textTransform="uppercase"
          >
            Action Recommended
          </Text>
          <Text color="$color" fontWeight="600" fontSize={15}>
            {action.title}
          </Text>
          <Text color="$secondaryText" fontSize={13} numberOfLines={2}>
            {action.description}
          </Text>
        </YStack>

        <ChevronRight size={20} color="$secondaryText" />
      </XStack>
    </Pressable>
  );
};

export function MonthlyInsightsCard({
  month,
  thingsChanged,
  recommendedAction,
  isLoading = false,
  onInsightPress,
  onActionPress,
}: MonthlyInsightsCardProps) {
  if (isLoading) {
    return (
      <GlassyCard>
        <YStack padding="$4" gap="$3" alignItems="center">
          <Text color="$secondaryText">Loading insights...</Text>
        </YStack>
      </GlassyCard>
    );
  }

  const hasData = thingsChanged.length > 0 || recommendedAction !== null;

  if (!hasData) {
    return (
      <GlassyCard>
        <YStack padding="$4" gap="$2" alignItems="center">
          <Text color="$secondaryText" fontSize={14}>
            No insights available for {formatMonth(month)}
          </Text>
          <Text color="$secondaryText" fontSize={12}>
            Check back after a few transactions
          </Text>
        </YStack>
      </GlassyCard>
    );
  }

  return (
    <GlassyCard>
      <YStack padding="$4" gap="$4">
        {/* Header */}
        <YStack gap="$1">
          <Text color="$color" fontSize={20} fontWeight="bold">
            This Month's Insights
          </Text>
          <Text color="$secondaryText" fontSize={13}>
            {formatMonth(month)}
          </Text>
        </YStack>

        {/* 3 Things Changed */}
        {thingsChanged.length > 0 && (
          <>
            <YStack gap="$2">
              <Text color="$color" fontSize={15} fontWeight="600">
                3 Things That Changed
              </Text>
              {thingsChanged.map((insight, index) => (
                <React.Fragment key={index}>
                  <InsightRow insight={insight} onPress={() => onInsightPress?.(insight)} />
                  {index < thingsChanged.length - 1 && <Separator borderColor="$borderColor" />}
                </React.Fragment>
              ))}
            </YStack>
          </>
        )}

        {/* 1 Action to Take */}
        {recommendedAction && (
          <>
            {thingsChanged.length > 0 && (
              <Separator marginVertical="$2" borderColor="$borderColor" />
            )}
            <YStack gap="$2">
              <Text color="$color" fontSize={15} fontWeight="600">
                1 Action to Take This Week
              </Text>
              <ActionCard
                action={recommendedAction}
                onPress={() => onActionPress?.(recommendedAction)}
              />
            </YStack>
          </>
        )}
      </YStack>
    </GlassyCard>
  );
}

export default MonthlyInsightsCard;
