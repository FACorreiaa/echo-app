/**
 * React Query hooks for managing Goals (savings goals, debt paydown, etc.)
 *
 * Features:
 * - List all goals with automatic caching
 * - Create new goals
 * - Update existing goals
 * - Delete goals
 * - Get detailed goal progress
 * - Contribute to a goal
 *
 * All hooks use React Query for:
 * - Automatic caching and revalidation
 * - Optimistic updates
 * - Background refetching
 * - Error handling
 */

import { financeClient } from "@/lib/api/client";
import type {
  GoalStatus,
  GoalType,
  Goal as ProtoGoal,
} from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/finance_pb";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

/**
 * Simplified Goal type for UI consumption
 * Converts proto types to JavaScript-friendly formats
 */
export interface Goal {
  id: string;
  name: string;
  type: "save" | "pay_down_debt" | "spend_cap";
  status: "active" | "paused" | "completed" | "archived";
  target: number; // In major currency units (e.g., 10000 for €10,000)
  current: number; // In major currency units
  startAt: Date | null;
  endAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  // Progress fields
  progressPercent: number; // 0-100
  pacePercent: number; // 100 = on track, <100 = behind
  isBehindPace: boolean;
  paceMessage: string; // "On track", "2 weeks behind", etc.
  daysRemaining: number;
  amountNeededPerDay: number; // In major currency units
}

/**
 * Contribution record
 */
export interface GoalContribution {
  id: string;
  amount: number; // In major currency units
  contributedAt: Date;
  note?: string;
  transactionId?: string; // If linked to a transaction
}

/**
 * Milestone tracking (25%, 50%, 75%, 100%)
 */
export interface GoalMilestone {
  percent: number;
  reached: boolean;
  reachedAt?: Date;
  expectedBy?: Date;
}

/**
 * Detailed goal progress with milestones and contributions
 */
export interface GoalProgress {
  goal: Goal;
  milestones: GoalMilestone[];
  recentContributions: GoalContribution[];
  needsAttention: boolean;
  nudgeMessage: string;
  suggestedContribution: number; // In major currency units
}

/**
 * Input for creating a new goal
 */
export interface CreateGoalInput {
  name: string;
  type: "save" | "pay_down_debt" | "spend_cap";
  target: number; // In major currency units
  startAt?: Date;
  endAt?: Date;
}

/**
 * Input for updating an existing goal
 */
export interface UpdateGoalInput {
  goalId: string;
  name?: string;
  target?: number; // In major currency units
  endAt?: Date;
  status?: "active" | "paused" | "completed" | "archived";
}

/**
 * Input for contributing to a goal
 */
export interface ContributeToGoalInput {
  goalId: string;
  amount: number; // In major currency units
  note?: string;
}

/**
 * Response from contributing to a goal
 */
export interface ContributeToGoalResult {
  goal: Goal;
  contribution: GoalContribution;
  milestoneReached: boolean;
  milestonePercent?: number;
  feedbackMessage: string; // "Great job! You're 50% there!"
}

// ============================================================================
// Type Converters
// ============================================================================

/**
 * Convert GoalType proto enum to UI-friendly string
 */
function convertGoalType(type: GoalType): "save" | "pay_down_debt" | "spend_cap" {
  switch (type) {
    case 1: // GOAL_TYPE_SAVE
      return "save";
    case 2: // GOAL_TYPE_PAY_DOWN_DEBT
      return "pay_down_debt";
    case 3: // GOAL_TYPE_SPEND_CAP
      return "spend_cap";
    default:
      return "save";
  }
}

/**
 * Convert GoalStatus proto enum to UI-friendly string
 */
function convertGoalStatus(status: GoalStatus): "active" | "paused" | "completed" | "archived" {
  switch (status) {
    case 1: // GOAL_STATUS_ACTIVE
      return "active";
    case 2: // GOAL_STATUS_PAUSED
      return "paused";
    case 3: // GOAL_STATUS_COMPLETED
      return "completed";
    case 4: // GOAL_STATUS_ARCHIVED
      return "archived";
    default:
      return "active";
  }
}

/**
 * Convert UI goal type to proto enum
 */
function convertToProtoGoalType(type: "save" | "pay_down_debt" | "spend_cap"): GoalType {
  switch (type) {
    case "save":
      return 1; // GOAL_TYPE_SAVE
    case "pay_down_debt":
      return 2; // GOAL_TYPE_PAY_DOWN_DEBT
    case "spend_cap":
      return 3; // GOAL_TYPE_SPEND_CAP
  }
}

/**
 * Convert UI goal status to proto enum
 */
function convertToProtoGoalStatus(
  status: "active" | "paused" | "completed" | "archived",
): GoalStatus {
  switch (status) {
    case "active":
      return 1; // GOAL_STATUS_ACTIVE
    case "paused":
      return 2; // GOAL_STATUS_PAUSED
    case "completed":
      return 3; // GOAL_STATUS_COMPLETED
    case "archived":
      return 4; // GOAL_STATUS_ARCHIVED
  }
}

/**
 * Convert minor units (cents) to major currency units (euros/dollars)
 */
function minorToMajor(amountMinor: bigint): number {
  return Number(amountMinor) / 100;
}

/**
 * Convert major currency units to minor units (cents)
 */
function majorToMinor(amount: number): bigint {
  return BigInt(Math.round(amount * 100));
}

/**
 * Convert proto Timestamp to Date
 */
function timestampToDate(timestamp: { seconds: bigint; nanos: number } | undefined): Date | null {
  if (!timestamp) return null;
  return new Date(Number(timestamp.seconds) * 1000);
}

/**
 * Convert Date to proto Timestamp
 */
function dateToTimestamp(date: Date | undefined) {
  if (!date) return undefined;
  return {
    seconds: BigInt(Math.floor(date.getTime() / 1000)),
    nanos: (date.getTime() % 1000) * 1000000,
  };
}

/**
 * Convert proto Goal to UI Goal
 */
function convertProtoGoal(protoGoal: ProtoGoal): Goal {
  return {
    id: protoGoal.id,
    name: protoGoal.name,
    type: convertGoalType(protoGoal.type),
    status: convertGoalStatus(protoGoal.status),
    target: protoGoal.target ? minorToMajor(protoGoal.target.amountMinor) : 0,
    current: minorToMajor(protoGoal.currentAmountMinor),
    startAt: timestampToDate(protoGoal.startAt),
    endAt: timestampToDate(protoGoal.endAt),
    createdAt: timestampToDate(protoGoal.createdAt) || new Date(),
    updatedAt: timestampToDate(protoGoal.updatedAt) || new Date(),
    progressPercent: protoGoal.progressPercent,
    pacePercent: protoGoal.pacePercent,
    isBehindPace: protoGoal.isBehindPace,
    paceMessage: protoGoal.paceMessage,
    daysRemaining: protoGoal.daysRemaining,
    amountNeededPerDay: protoGoal.amountNeededPerDay
      ? minorToMajor(protoGoal.amountNeededPerDay.amountMinor)
      : 0,
  };
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * List all goals with optional status filter
 *
 * @param statusFilter - Optional filter for goal status (active, paused, etc.)
 * @returns Query result with goals array
 *
 * @example
 * const { data: goals, isLoading } = useGoals("active");
 */
export function useGoals(statusFilter?: "active" | "paused" | "completed" | "archived") {
  return useQuery({
    queryKey: ["goals", statusFilter],
    queryFn: async (): Promise<Goal[]> => {
      const response = await financeClient.listGoals({
        statusFilter: statusFilter ? convertToProtoGoalStatus(statusFilter) : undefined,
      });

      return (response.goals || []).map(convertProtoGoal);
    },
    staleTime: 5 * 60_000, // 5 minutes
  });
}

/**
 * Get a single goal by ID
 *
 * @param goalId - The goal ID to fetch
 * @returns Query result with goal data
 *
 * @example
 * const { data: goal, isLoading } = useGoal("goal-123");
 */
export function useGoal(goalId: string) {
  return useQuery({
    queryKey: ["goal", goalId],
    queryFn: async (): Promise<Goal> => {
      const response = await financeClient.getGoal({ goalId });

      if (!response.goal) {
        throw new Error("Goal not found");
      }

      return convertProtoGoal(response.goal);
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * Get detailed progress for a goal including milestones and contributions
 *
 * @param goalId - The goal ID to fetch progress for
 * @returns Query result with goal progress data
 *
 * @example
 * const { data: progress, isLoading } = useGoalProgress("goal-123");
 */
export function useGoalProgress(goalId: string) {
  return useQuery({
    queryKey: ["goal-progress", goalId],
    queryFn: async (): Promise<GoalProgress> => {
      const response = await financeClient.getGoalProgress({ goalId });

      if (!response.goal) {
        throw new Error("Goal not found");
      }

      return {
        goal: convertProtoGoal(response.goal),
        milestones: (response.milestones || []).map((m) => ({
          percent: m.percent,
          reached: m.reached,
          reachedAt: timestampToDate(m.reachedAt) || undefined,
          expectedBy: timestampToDate(m.expectedBy) || undefined,
        })),
        recentContributions: (response.recentContributions || []).map((c) => ({
          id: c.id,
          amount: c.amount ? minorToMajor(c.amount.amountMinor) : 0,
          contributedAt: timestampToDate(c.contributedAt) || new Date(),
          note: c.note,
          transactionId: c.transactionId,
        })),
        needsAttention: response.needsAttention,
        nudgeMessage: response.nudgeMessage,
        suggestedContribution: response.suggestedContribution
          ? minorToMajor(response.suggestedContribution.amountMinor)
          : 0,
      };
    },
    staleTime: 2 * 60_000, // 2 minutes (progress changes more frequently)
  });
}

/**
 * Create a new goal
 *
 * @returns Mutation result with mutate function
 *
 * @example
 * const createGoal = useCreateGoal();
 * createGoal.mutate({ name: "Emergency Fund", type: "save", target: 10000 });
 */
export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGoalInput): Promise<Goal> => {
      const response = await financeClient.createGoal({
        name: input.name,
        type: convertToProtoGoalType(input.type),
        target: {
          amountMinor: majorToMinor(input.target),
          currencyCode: "EUR",
        },
        startAt: dateToTimestamp(input.startAt),
        endAt: dateToTimestamp(input.endAt),
      });

      if (!response.goal) {
        throw new Error("Failed to create goal");
      }

      return convertProtoGoal(response.goal);
    },
    onSuccess: () => {
      // Invalidate goals list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

/**
 * Update an existing goal
 *
 * @returns Mutation result with mutate function
 *
 * @example
 * const updateGoal = useUpdateGoal();
 * updateGoal.mutate({ goalId: "goal-123", target: 12000 });
 */
export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateGoalInput): Promise<Goal> => {
      const response = await financeClient.updateGoal({
        goalId: input.goalId,
        name: input.name,
        target: input.target
          ? {
              amountMinor: majorToMinor(input.target),
              currencyCode: "EUR",
            }
          : undefined,
        endAt: dateToTimestamp(input.endAt),
        status: input.status ? convertToProtoGoalStatus(input.status) : undefined,
      });

      if (!response.goal) {
        throw new Error("Failed to update goal");
      }

      return convertProtoGoal(response.goal);
    },
    onSuccess: (updatedGoal) => {
      // Update the specific goal in cache
      queryClient.setQueryData(["goal", updatedGoal.id], updatedGoal);
      // Invalidate goals list and progress
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-progress", updatedGoal.id] });
    },
  });
}

/**
 * Delete a goal
 *
 * @returns Mutation result with mutate function
 *
 * @example
 * const deleteGoal = useDeleteGoal();
 * deleteGoal.mutate("goal-123");
 */
export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goalId: string): Promise<void> => {
      await financeClient.deleteGoal({ goalId });
    },
    onSuccess: (_, goalId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: ["goal", goalId] });
      queryClient.removeQueries({ queryKey: ["goal-progress", goalId] });
      // Invalidate goals list
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}

/**
 * Contribute to a goal (add money)
 *
 * @returns Mutation result with mutate function and contribution result
 *
 * @example
 * const contribute = useContributeToGoal();
 * contribute.mutate({ goalId: "goal-123", amount: 500, note: "Bonus money" });
 */
export function useContributeToGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ContributeToGoalInput): Promise<ContributeToGoalResult> => {
      const response = await financeClient.contributeToGoal({
        goalId: input.goalId,
        amount: {
          amountMinor: majorToMinor(input.amount),
          currencyCode: "EUR",
        },
        note: input.note,
      });

      if (!response.goal || !response.contribution) {
        throw new Error("Failed to contribute to goal");
      }

      return {
        goal: convertProtoGoal(response.goal),
        contribution: {
          id: response.contribution.id,
          amount: minorToMajor(response.contribution.amount?.amountMinor || BigInt(0)),
          contributedAt: timestampToDate(response.contribution.contributedAt) || new Date(),
          note: response.contribution.note,
          transactionId: response.contribution.transactionId,
        },
        milestoneReached: response.milestoneReached,
        milestonePercent: response.milestonePercent,
        feedbackMessage: response.feedbackMessage,
      };
    },
    onSuccess: (result) => {
      // Update goal in cache
      queryClient.setQueryData(["goal", result.goal.id], result.goal);
      // Invalidate goals list and progress to show new contribution
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goal-progress", result.goal.id] });
    },
  });
}
