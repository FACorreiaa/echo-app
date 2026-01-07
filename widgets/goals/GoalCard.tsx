import { TrendingDown, TrendingUp } from "@tamagui/lucide-icons";
import { styled, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import type { Goal } from "@/lib/hooks/use-goals";

import { GoalProgressBar } from "./GoalProgressBar";

// ============================================================================
// Styled Components
// ============================================================================

const GoalTitle = styled(Text, {
  color: "$color",
  fontSize: 18,
  fontFamily: "$heading",
});

const GoalSubtitle = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
});

const ProgressLabel = styled(Text, {
  color: "$color",
  fontSize: 24,
  fontFamily: "$heading",
});

const TargetLabel = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
});

const PacingBadge = styled(XStack, {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  alignItems: "center",
  gap: 4,
  variants: {
    status: {
      ahead: { backgroundColor: "rgba(34, 197, 94, 0.2)" },
      behind: { backgroundColor: "rgba(239, 68, 68, 0.2)" },
      onTrack: { backgroundColor: "rgba(45, 166, 250, 0.2)" },
    },
  } as const,
});

const statusColors = {
  ahead: "#22c55e",
  behind: "#ef4444",
  onTrack: "#2da6fa",
};

// ============================================================================
// Helper Functions
// ============================================================================

function getPacingStatus(pacePercent: number): "ahead" | "behind" | "onTrack" {
  if (pacePercent > 105) return "ahead";
  if (pacePercent < 95) return "behind";
  return "onTrack";
}

function formatDeadline(endAt: Date | null): string {
  if (!endAt) return "No deadline";

  const month = endAt.toLocaleDateString("en-US", { month: "short" });
  const year = endAt.getFullYear();
  return `${month} ${year}`;
}

// ============================================================================
// Component
// ============================================================================

export interface GoalCardProps {
  goal: Goal;
  onPress?: () => void;
}

/**
 * GoalCard - Displays a single goal with progress and pacing information
 *
 * Features:
 * - Shows goal name, target deadline, and current/target amounts
 * - Visual progress bar
 * - Pacing badge (ahead/on track/behind)
 * - Tappable to view goal details
 */
export function GoalCard({ goal, onPress }: GoalCardProps) {
  const progress = (goal.current / goal.target) * 100;
  const pacingStatus = getPacingStatus(goal.pacePercent);

  return (
    <GlassyCard onPress={onPress}>
      <YStack gap={16}>
        {/* Header: Title + Pacing Badge */}
        <XStack justifyContent="space-between" alignItems="flex-start">
          <YStack gap={4} flex={1}>
            <GoalTitle>{goal.name}</GoalTitle>
            <GoalSubtitle>Target: {formatDeadline(goal.endAt)}</GoalSubtitle>
          </YStack>

          <PacingBadge status={pacingStatus}>
            {pacingStatus === "ahead" && <TrendingUp size={14} color={statusColors.ahead as any} />}
            {pacingStatus === "behind" && (
              <TrendingDown size={14} color={statusColors.behind as any} />
            )}
            <Text color={statusColors[pacingStatus] as any} fontSize={12} fontFamily="$body">
              {goal.paceMessage}
            </Text>
          </PacingBadge>
        </XStack>

        {/* Progress Section */}
        <YStack gap={8}>
          <XStack justifyContent="space-between" alignItems="baseline">
            <ProgressLabel>€{goal.current.toLocaleString()}</ProgressLabel>
            <TargetLabel>of €{goal.target.toLocaleString()}</TargetLabel>
          </XStack>

          <GoalProgressBar progress={progress} status={pacingStatus} />
        </YStack>
      </YStack>
    </GlassyCard>
  );
}
