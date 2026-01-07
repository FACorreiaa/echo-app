/**
 * React Query hooks for managing Recurring Subscriptions
 *
 * Features:
 * - List all recurring subscriptions
 * - Detect new subscriptions from transaction history
 * - Get review checklist for subscriptions
 * - Update subscription status (active, paused, canceled)
 *
 * All hooks use React Query for:
 * - Automatic caching and revalidation
 * - Optimistic updates
 * - Background refetching
 * - Error handling
 */

import type {
  RecurringSubscription as ProtoSubscription,
  RecurringStatus,
  RecurringCadence,
} from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/finance_pb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { financeClient } from "@/lib/api/client";

// ============================================================================
// Types
// ============================================================================

/**
 * Simplified Subscription type for UI consumption
 */
export interface Subscription {
  id: string;
  merchantName: string;
  amount: number; // In major currency units
  cadence: "monthly" | "weekly" | "yearly" | "quarterly";
  status: "active" | "paused" | "canceled";
  firstSeenAt: Date | null;
  lastSeenAt: Date | null;
  nextExpectedAt: Date | null;
  totalSpent: number; // In major currency units
  occurrenceCount: number;
  categoryName?: string;
}

/**
 * Review checklist item for a subscription
 */
export interface ReviewChecklistItem {
  subscription: Subscription;
  reasonMessage: string;
  recommendedCancel: boolean;
}

/**
 * Input for updating subscription status
 */
export interface UpdateSubscriptionStatusInput {
  subscriptionId: string;
  status: "active" | "paused" | "canceled";
  note?: string;
}

// ============================================================================
// Type Converters
// ============================================================================

/**
 * Convert RecurringCadence proto enum to UI-friendly string
 */
function convertCadence(cadence: RecurringCadence): "monthly" | "weekly" | "yearly" | "quarterly" {
  switch (cadence) {
    case 1: // RECURRING_CADENCE_MONTHLY
      return "monthly";
    case 2: // RECURRING_CADENCE_WEEKLY
      return "weekly";
    case 3: // RECURRING_CADENCE_YEARLY
      return "yearly";
    case 4: // RECURRING_CADENCE_QUARTERLY
      return "quarterly";
    default:
      return "monthly";
  }
}

/**
 * Convert RecurringStatus proto enum to UI-friendly string
 */
function convertStatus(status: RecurringStatus): "active" | "paused" | "canceled" {
  switch (status) {
    case 1: // RECURRING_STATUS_ACTIVE
      return "active";
    case 2: // RECURRING_STATUS_PAUSED
      return "paused";
    case 3: // RECURRING_STATUS_CANCELED
      return "canceled";
    default:
      return "active";
  }
}

/**
 * Convert UI status to proto enum
 */
function convertToProtoStatus(status: "active" | "paused" | "canceled"): RecurringStatus {
  switch (status) {
    case "active":
      return 1; // RECURRING_STATUS_ACTIVE
    case "paused":
      return 2; // RECURRING_STATUS_PAUSED
    case "canceled":
      return 3; // RECURRING_STATUS_CANCELED
  }
}

/**
 * Convert minor units (cents) to major currency units
 */
function minorToMajor(amountMinor: bigint): number {
  return Number(amountMinor) / 100;
}

/**
 * Convert proto Timestamp to Date
 */
function timestampToDate(timestamp: { seconds: bigint; nanos: number } | undefined): Date | null {
  if (!timestamp) return null;
  return new Date(Number(timestamp.seconds) * 1000);
}

/**
 * Convert proto Subscription to UI Subscription
 */
function convertProtoSubscription(protoSub: ProtoSubscription): Subscription {
  return {
    id: protoSub.id,
    merchantName: protoSub.merchantName,
    amount: protoSub.amount ? minorToMajor(protoSub.amount.amountMinor) : 0,
    cadence: convertCadence(protoSub.cadence),
    status: convertStatus(protoSub.status),
    firstSeenAt: timestampToDate(protoSub.firstSeenAt),
    lastSeenAt: timestampToDate(protoSub.lastSeenAt),
    nextExpectedAt: timestampToDate(protoSub.nextExpectedAt),
    totalSpent: protoSub.totalSpent ? minorToMajor(protoSub.totalSpent.amountMinor) : 0,
    occurrenceCount: protoSub.occurrenceCount,
    categoryName: protoSub.categoryName,
  };
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * List all recurring subscriptions with optional status filter
 *
 * @param statusFilter - Optional filter for subscription status
 * @param includeCanceled - Whether to include canceled subscriptions
 * @returns Query result with subscriptions array and total monthly cost
 *
 * @example
 * const { data, isLoading } = useSubscriptions("active");
 */
export function useSubscriptions(
  statusFilter?: "active" | "paused" | "canceled",
  includeCanceled = false,
) {
  return useQuery({
    queryKey: ["subscriptions", statusFilter, includeCanceled],
    queryFn: async (): Promise<{
      subscriptions: Subscription[];
      totalMonthlyCost: number;
    }> => {
      const response = await financeClient.listRecurringSubscriptions({
        statusFilter: statusFilter ? convertToProtoStatus(statusFilter) : undefined,
        includeCanceled,
      });

      return {
        subscriptions: (response.subscriptions || []).map(convertProtoSubscription),
        totalMonthlyCost: response.totalMonthlyCost
          ? minorToMajor(response.totalMonthlyCost.amountMinor)
          : 0,
      };
    },
    staleTime: 5 * 60_000, // 5 minutes
  });
}

/**
 * Trigger detection of recurring subscriptions from transaction history
 *
 * @returns Mutation result with mutate function
 *
 * @example
 * const detectSubs = useDetectSubscriptions();
 * detectSubs.mutate();
 */
export function useDetectSubscriptions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<{
      detected: Subscription[];
      newCount: number;
      updatedCount: number;
    }> => {
      const response = await financeClient.detectRecurringSubscriptions({});

      return {
        detected: (response.detected || []).map(convertProtoSubscription),
        newCount: response.newCount,
        updatedCount: response.updatedCount,
      };
    },
    onSuccess: () => {
      // Invalidate subscriptions list to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
    },
  });
}

/**
 * Get review checklist for subscriptions that need attention
 *
 * @returns Query result with review checklist items
 *
 * @example
 * const { data: checklist, isLoading } = useSubscriptionReviewChecklist();
 */
export function useSubscriptionReviewChecklist() {
  return useQuery({
    queryKey: ["subscription-review-checklist"],
    queryFn: async (): Promise<ReviewChecklistItem[]> => {
      const response = await financeClient.getSubscriptionReviewChecklist({});

      return (response.items || []).map((item) => ({
        subscription: item.subscription
          ? convertProtoSubscription(item.subscription)
          : ({} as Subscription),
        reasonMessage: item.reasonMessage,
        recommendedCancel: item.recommendedCancel,
      }));
    },
    staleTime: 10 * 60_000, // 10 minutes
  });
}

/**
 * Update subscription status (mark as reviewed, canceled, etc.)
 *
 * @returns Mutation result with mutate function
 *
 * @example
 * const updateStatus = useUpdateSubscriptionStatus();
 * updateStatus.mutate({ subscriptionId: "sub-123", status: "canceled" });
 */
export function useUpdateSubscriptionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSubscriptionStatusInput): Promise<Subscription> => {
      const response = await financeClient.updateSubscriptionStatus({
        subscriptionId: input.subscriptionId,
        status: convertToProtoStatus(input.status),
      });

      if (!response.subscription) {
        throw new Error("Failed to update subscription status");
      }

      return convertProtoSubscription(response.subscription);
    },
    onSuccess: (updatedSubscription) => {
      // Update the subscription in cache
      queryClient.setQueryData(["subscription", updatedSubscription.id], updatedSubscription);
      // Invalidate lists to trigger refetch
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-review-checklist"] });
    },
  });
}

/**
 * Get a single subscription by ID
 *
 * Note: This function will fetch all subscriptions and filter client-side
 * since there's no getRecurringSubscription endpoint
 *
 * @param subscriptionId - The subscription ID
 * @returns Query result with subscription data
 *
 * @example
 * const { data: subscription, isLoading } = useSubscription("sub-123");
 */
export function useSubscription(subscriptionId: string) {
  return useQuery({
    queryKey: ["subscription", subscriptionId],
    queryFn: async (): Promise<Subscription | null> => {
      const response = await financeClient.listRecurringSubscriptions({});
      const subscription = response.subscriptions.find((s) => s.id === subscriptionId);

      if (!subscription) {
        return null;
      }

      return convertProtoSubscription(subscription);
    },
    staleTime: 5 * 60_000,
    enabled: !!subscriptionId,
  });
}
