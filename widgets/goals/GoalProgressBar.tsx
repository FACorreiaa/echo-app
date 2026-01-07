import { YStack } from "tamagui";

// ============================================================================
// Types
// ============================================================================

export type PacingStatus = "ahead" | "behind" | "onTrack";

const statusColors: Record<PacingStatus, string> = {
  ahead: "#22c55e",
  behind: "#ef4444",
  onTrack: "#2da6fa",
};

// ============================================================================
// Component
// ============================================================================

export interface GoalProgressBarProps {
  progress: number; // 0-100
  status: PacingStatus;
  height?: number;
}

/**
 * GoalProgressBar - Visual progress indicator for goals
 *
 * Features:
 * - Colored based on pacing status (ahead/on track/behind)
 * - Smooth animated progress bar
 * - Handles edge cases (0%, >100%)
 */
export function GoalProgressBar({ progress, status, height = 8 }: GoalProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <YStack
      height={height}
      backgroundColor="$listItemBackground"
      borderRadius={4}
      overflow="hidden"
    >
      <YStack
        height="100%"
        width={`${clampedProgress}%`}
        backgroundColor={statusColors[status] as any}
        borderRadius={4}
      />
    </YStack>
  );
}
