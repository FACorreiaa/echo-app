import { Search } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Alert, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, H2, Tabs, Text, XStack, YStack } from "tamagui";

import { GradientBackground } from "@/components/animations/GradientBackground";
import { GlassyCard } from "@/components/ui/GlassyCard";
import {
  useDetectSubscriptions,
  useSubscriptionReviewChecklist,
  useSubscriptions,
  useUpdateSubscriptionStatus,
  type Subscription,
} from "@/lib/hooks/use-subscriptions";
import { ReviewChecklistCard, SubscriptionList } from "@/widgets/subscriptions";

// ============================================================================
// Helpers
// ============================================================================

const handleSubscriptionPress = (subscription: Subscription) => {
  // TODO: Navigate to subscription detail view
  console.log("Subscription pressed:", subscription);
};

// ============================================================================
// Component
// ============================================================================

export default function SubscriptionsScreen() {
  const [activeTab, setActiveTab] = useState<"all" | "review">("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch subscriptions
  const { data: subscriptionsData, isLoading, isError, refetch } = useSubscriptions();
  const subscriptions = subscriptionsData?.subscriptions || [];
  const totalMonthlyCost = subscriptionsData?.totalMonthlyCost || 0;

  // Fetch review checklist
  const {
    data: reviewChecklist = [],
    isLoading: checklistLoading,
    refetch: refetchChecklist,
  } = useSubscriptionReviewChecklist();

  // Mutations
  const detectSubscriptions = useDetectSubscriptions();
  const updateStatus = useUpdateSubscriptionStatus();

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchChecklist()]);
    setRefreshing(false);
  };

  const handleDetectSubscriptions = async () => {
    try {
      const result = await detectSubscriptions.mutateAsync();
      const totalNew = result.newCount + result.updatedCount;

      if (totalNew > 0) {
        Alert.alert(
          "Detection Complete",
          `Found ${result.newCount} new subscriptions and updated ${result.updatedCount} existing ones.`,
        );
      } else {
        Alert.alert("All Set!", "No new subscriptions detected.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to detect subscriptions. Please try again.");
      console.error("Detect subscriptions error:", error);
    }
  };

  const handleMarkReviewed = async (subscriptionId: string) => {
    try {
      await updateStatus.mutateAsync({
        subscriptionId,
        status: "active",
      });
      Alert.alert("Success", "Subscription marked as reviewed");
    } catch (error) {
      Alert.alert("Error", "Failed to update subscription");
      console.error("Update status error:", error);
    }
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    Alert.alert(
      "Cancel Subscription",
      "Are you sure you want to mark this subscription as canceled?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            try {
              await updateStatus.mutateAsync({
                subscriptionId,
                status: "canceled",
              });
              Alert.alert("Canceled", "Subscription has been marked as canceled");
            } catch (error) {
              Alert.alert("Error", "Failed to cancel subscription");
              console.error("Cancel subscription error:", error);
            }
          },
        },
      ],
    );
  };

  // Filter subscriptions
  const activeSubscriptions = subscriptions.filter((s) => s.status === "active");
  const pendingReviewCount = reviewChecklist.length;

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <YStack flex={1}>
          {/* Header */}
          <YStack paddingHorizontal={20} paddingTop={20} paddingBottom={16} gap={12}>
            <H2 color="$color" fontSize={28} fontWeight="bold">
              Subscriptions
            </H2>

            {/* Summary Card */}
            <GlassyCard>
              <XStack padding="$4" justifyContent="space-between" alignItems="center">
                <YStack>
                  <Text color="$secondaryText" fontSize={12} textTransform="uppercase">
                    Monthly Total
                  </Text>
                  <Text color="$color" fontSize={28} fontWeight="bold">
                    €{totalMonthlyCost.toFixed(2)}
                  </Text>
                  <Text color="$secondaryText" fontSize={13}>
                    {activeSubscriptions.length} active subscriptions
                  </Text>
                </YStack>

                <Button
                  size="$3"
                  backgroundColor="$accentColor"
                  color="white"
                  onPress={handleDetectSubscriptions}
                  disabled={detectSubscriptions.isPending}
                  icon={<Search size={16} color="white" />}
                  pressStyle={{ opacity: 0.8 }}
                >
                  {detectSubscriptions.isPending ? "Detecting..." : "Detect"}
                </Button>
              </XStack>
            </GlassyCard>
          </YStack>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as "all" | "review")}
            flex={1}
            flexDirection="column"
          >
            <Tabs.List
              backgroundColor="transparent"
              paddingHorizontal={20}
              gap={8}
              marginBottom={12}
            >
              <Tabs.Tab
                value="all"
                flex={1}
                backgroundColor={activeTab === "all" ? "$accentColor" : "$backgroundHover"}
                borderRadius={8}
                paddingVertical={10}
              >
                <Text
                  color={activeTab === "all" ? "white" : "$secondaryText"}
                  fontSize={14}
                  fontWeight="600"
                >
                  All ({subscriptions.length})
                </Text>
              </Tabs.Tab>

              <Tabs.Tab
                value="review"
                flex={1}
                backgroundColor={activeTab === "review" ? "$accentColor" : "$backgroundHover"}
                borderRadius={8}
                paddingVertical={10}
              >
                <XStack alignItems="center" gap={6}>
                  <Text
                    color={activeTab === "review" ? "white" : "$secondaryText"}
                    fontSize={14}
                    fontWeight="600"
                  >
                    Review
                  </Text>
                  {pendingReviewCount > 0 && (
                    <YStack
                      backgroundColor={activeTab === "review" ? "white" : "#ef4444"}
                      width={20}
                      height={20}
                      borderRadius={10}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text
                        color={activeTab === "review" ? "$accentColor" : "white"}
                        fontSize={11}
                        fontWeight="bold"
                      >
                        {pendingReviewCount}
                      </Text>
                    </YStack>
                  )}
                </XStack>
              </Tabs.Tab>
            </Tabs.List>

            {/* All Subscriptions Tab */}
            <Tabs.Content value="all" flex={1}>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
              >
                {/* Loading State */}
                {isLoading && (
                  <GlassyCard>
                    <YStack padding="$4" alignItems="center">
                      <Text color="$secondaryText">Loading subscriptions...</Text>
                    </YStack>
                  </GlassyCard>
                )}

                {/* Error State */}
                {isError && (
                  <GlassyCard>
                    <YStack padding="$4" alignItems="center" gap="$2">
                      <Text color="$color" fontWeight="600">
                        Unable to load subscriptions
                      </Text>
                      <Text color="$secondaryText" fontSize={14}>
                        Check your connection and try again
                      </Text>
                    </YStack>
                  </GlassyCard>
                )}

                {/* Subscriptions List */}
                {!isLoading && !isError && (
                  <YStack>
                    <Text color="$color" fontSize={16} fontWeight="600" marginBottom={12}>
                      Active Subscriptions
                    </Text>
                    <SubscriptionList
                      subscriptions={activeSubscriptions}
                      onSubscriptionPress={handleSubscriptionPress}
                      emptyMessage="No active subscriptions. Tap 'Detect' to find recurring charges."
                    />
                  </YStack>
                )}
              </ScrollView>
            </Tabs.Content>

            {/* Review Checklist Tab */}
            <Tabs.Content value="review" flex={1}>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
              >
                {/* Loading State */}
                {checklistLoading && (
                  <GlassyCard>
                    <YStack padding="$4" alignItems="center">
                      <Text color="$secondaryText">Loading review checklist...</Text>
                    </YStack>
                  </GlassyCard>
                )}

                {/* Empty State */}
                {!checklistLoading && reviewChecklist.length === 0 && (
                  <GlassyCard>
                    <YStack padding="$6" alignItems="center" gap="$2">
                      <Text fontSize={32}>✅</Text>
                      <Text color="$color" fontSize={18} fontWeight="600">
                        All Caught Up!
                      </Text>
                      <Text color="$secondaryText" fontSize={14} textAlign="center">
                        No subscriptions need review right now.
                      </Text>
                    </YStack>
                  </GlassyCard>
                )}

                {/* Review Checklist */}
                {!checklistLoading && reviewChecklist.length > 0 && (
                  <YStack gap={16}>
                    <YStack backgroundColor="$backgroundHover" padding={12} borderRadius={8}>
                      <Text color="$color" fontSize={14} fontWeight="600" marginBottom={4}>
                        💡 Review Tips
                      </Text>
                      <Text color="$secondaryText" fontSize={13} lineHeight={18}>
                        We analyzed your subscriptions and found some opportunities to save money or
                        optimize your spending.
                      </Text>
                    </YStack>

                    {reviewChecklist.map((item) => (
                      <ReviewChecklistCard
                        key={item.subscription.id}
                        item={item}
                        onMarkReviewed={handleMarkReviewed}
                        onCancel={handleCancelSubscription}
                        isProcessing={updateStatus.isPending}
                      />
                    ))}
                  </YStack>
                )}
              </ScrollView>
            </Tabs.Content>
          </Tabs>
        </YStack>
      </SafeAreaView>
    </GradientBackground>
  );
}
