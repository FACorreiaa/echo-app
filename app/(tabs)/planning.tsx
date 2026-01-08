import { ArrowLeft, FileSpreadsheet, Pencil, Plus } from "@tamagui/lucide-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Progress, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components";
import { useGoals } from "@/lib/hooks/use-goals";
import {
  useDeletePlan,
  usePlans,
  useSetActivePlan,
  type PlanItem,
  type UserPlan,
} from "@/lib/hooks/use-plans";
import { useSubscriptions, type Subscription } from "@/lib/hooks/use-subscriptions";
import {
  CreatePlanSheet,
  EditBudgetSheet,
  EditRecurringSheet,
  PlanCard,
  PlanDashboard,
} from "@/widgets/planning";

// Format next date for subscription
function formatNextDate(date: Date | null) {
  if (!date) return "Unknown";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Category emojis for goal types
const GOAL_EMOJIS: Record<string, string> = {
  save: "💰",
  pay_down_debt: "💳",
  spend_cap: "🎯",
};

type TabType = "plans" | "goals" | "budgets" | "recurring";

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("plans");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<UserPlan | null>(null);

  // Edit sheet state
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [editRecurringOpen, setEditRecurringOpen] = useState(false);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<PlanItem | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  // Subscriptions from API (used in renderRecurring)
  const { data: subsData, isLoading: subscriptionsLoading } = useSubscriptions("active");
  const subscriptions = subsData?.subscriptions ?? [];

  // Goals from API
  const { data: goals, isLoading: goalsLoading } = useGoals();

  // Params from import flow
  const params = useLocalSearchParams();
  const fromImport = params.fromImport === "true";
  const importedCategories = params.categories
    ? JSON.parse(params.categories as string)
    : undefined;

  // Auto-open create sheet if coming from import
  useEffect(() => {
    if (fromImport) {
      setCreateSheetOpen(true);
    }
  }, [fromImport]);

  // Plans from API
  const { data: plans, isLoading: plansLoading, error: plansError } = usePlans();
  const setActivePlan = useSetActivePlan();
  const deletePlan = useDeletePlan();

  const handleDeletePlan = (planId: string) => {
    Alert.alert(
      "Delete Plan",
      "Are you sure you want to delete this plan? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePlan.mutate(planId),
        },
      ],
    );
  };

  const renderGoals = () => (
    <YStack gap="$4">
      <Text color="$color" fontSize={18} fontWeight="bold">
        Active Goals
      </Text>
      {goalsLoading ? (
        <YStack alignItems="center" padding="$6">
          <ActivityIndicator color="#6366F1" />
          <Text color="$secondaryText" marginTop="$2">
            Loading goals...
          </Text>
        </YStack>
      ) : !goals || goals.length === 0 ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>🎯</Text>
            <Text color="$color" fontWeight="600">
              No Goals Yet
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Create your first savings goal to start tracking
            </Text>
          </YStack>
        </GlassyCard>
      ) : (
        goals.map((goal) => (
          <GlassyCard key={goal.id}>
            <YStack padding="$4" gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={20}>{GOAL_EMOJIS[goal.type] ?? "🎯"}</Text>
                  <Text color="$color" fontWeight="600">
                    {goal.name}
                  </Text>
                </XStack>
                <Text color="$secondaryText">{goal.progressPercent}%</Text>
              </XStack>
              <Progress value={goal.progressPercent} backgroundColor="$backgroundHover">
                <Progress.Indicator backgroundColor="$accentColor" />
              </Progress>
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$secondaryText" fontSize={14}>
                  €{goal.current.toLocaleString()} / €{goal.target.toLocaleString()}
                </Text>
                <Text
                  color={goal.isBehindPace ? "#ef4444" : "#22c55e"}
                  fontSize={14}
                  fontWeight="600"
                >
                  {goal.paceMessage}
                </Text>
              </XStack>
            </YStack>
          </GlassyCard>
        ))
      )}

      {/* Pockets Section - Coming Soon */}
      <Text color="$color" fontSize={18} fontWeight="bold" marginTop="$4">
        Pockets
      </Text>
      <XStack flexWrap="wrap" gap="$3">
        {/* Add New Pocket */}
        <YStack
          width="47%"
          borderWidth={2}
          borderColor="$borderColor"
          borderStyle="dashed"
          borderRadius="$4"
          padding="$4"
          alignItems="center"
          justifyContent="center"
          gap="$2"
          minHeight={120}
          pressStyle={{ opacity: 0.7 }}
        >
          <Plus size={24} color="$secondaryText" />
          <Text color="$secondaryText" fontSize={14}>
            Coming Soon
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );

  // Get budgets from active plan
  const activePlan = plans?.find((p) => p.status === "active");
  const budgets =
    activePlan?.categoryGroups
      ?.flatMap((group) =>
        group.categories.flatMap((cat) =>
          cat.items.map((item) => ({
            id: item.id,
            name: item.name,
            spent: item.actual ?? 0,
            limit: item.budgeted ?? 0,
            emoji: cat.icon ?? "📊",
          })),
        ),
      )
      .filter((b) => b.limit > 0) ?? [];

  const renderBudgets = () => (
    <YStack gap="$4">
      <Text color="$color" fontSize={18} fontWeight="bold">
        Monthly Budgets
      </Text>
      {!activePlan ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>📊</Text>
            <Text color="$color" fontWeight="600">
              No Active Plan
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Create a financial plan to set monthly budgets
            </Text>
          </YStack>
        </GlassyCard>
      ) : budgets.length === 0 ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>💰</Text>
            <Text color="$color" fontWeight="600">
              No Budgets Set
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Add category budgets to your plan
            </Text>
          </YStack>
        </GlassyCard>
      ) : (
        budgets.map((budget) => {
          const progress = budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0;
          const isOverBudget = progress > 100;
          return (
            <Pressable
              key={budget.id}
              onPress={() => {
                setSelectedBudgetItem({
                  id: budget.id,
                  name: budget.name,
                  budgeted: budget.limit,
                  actual: budget.spent,
                  widgetType: "input",
                  fieldType: "currency",
                  labels: {},
                });
                setEditBudgetOpen(true);
              }}
            >
              <GlassyCard>
                <YStack padding="$4" gap="$3">
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack alignItems="center" gap="$2">
                      <Text fontSize={20}>{budget.emoji}</Text>
                      <Text color="$color" fontWeight="600">
                        {budget.name}
                      </Text>
                    </XStack>
                    <Text color={isOverBudget ? "#ef4444" : "$secondaryText"}>
                      {Math.round(progress)}%
                    </Text>
                  </XStack>
                  <Progress value={Math.min(progress, 100)} backgroundColor="$backgroundHover">
                    <Progress.Indicator
                      backgroundColor={isOverBudget ? "#ef4444" : "$accentColor"}
                    />
                  </Progress>
                  <XStack justifyContent="space-between" alignItems="center">
                    <Text color="$secondaryText" fontSize={14}>
                      €{budget.spent} / €{budget.limit}
                    </Text>
                    <Text color="$secondaryText" fontSize={14}>
                      €{Math.max(0, budget.limit - budget.spent)} left
                    </Text>
                  </XStack>
                </YStack>
              </GlassyCard>
            </Pressable>
          );
        })
      )}
    </YStack>
  );

  const renderRecurring = () => (
    <YStack gap="$4">
      <Text color="$color" fontSize={18} fontWeight="bold">
        Recurring Subscriptions
      </Text>
      {subscriptionsLoading ? (
        <YStack alignItems="center" padding="$6">
          <ActivityIndicator color="#6366F1" />
          <Text color="$secondaryText" marginTop="$2">
            Loading subscriptions...
          </Text>
        </YStack>
      ) : subscriptions.length === 0 ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>📺</Text>
            <Text color="$color" fontWeight="600">
              No Subscriptions
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Import transactions to detect recurring charges
            </Text>
          </YStack>
        </GlassyCard>
      ) : (
        subscriptions.map((sub: Subscription) => (
          <Pressable
            key={sub.id}
            onPress={() => {
              setSelectedSubscription(sub);
              setEditRecurringOpen(true);
            }}
          >
            <GlassyCard>
              <XStack padding="$4" alignItems="center" gap="$3">
                <YStack
                  backgroundColor="$backgroundHover"
                  width={48}
                  height={48}
                  borderRadius={24}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Text fontSize={24}>📺</Text>
                </YStack>
                <YStack flex={1}>
                  <Text color="$color" fontWeight="600">
                    {sub.merchantName}
                  </Text>
                  <Text color="$secondaryText" fontSize={14}>
                    Next: {formatNextDate(sub.nextExpectedAt)}
                  </Text>
                </YStack>
                <Text color="$color" fontWeight="bold">
                  €{sub.amount.toFixed(2)}
                </Text>
              </XStack>
            </GlassyCard>
          </Pressable>
        ))
      )}
    </YStack>
  );

  const renderPlans = () => (
    <YStack gap="$4">
      <Text color="$color" fontSize={18} fontWeight="bold">
        Financial Plans
      </Text>

      {plansLoading && (
        <YStack alignItems="center" padding="$6">
          <ActivityIndicator color="#6366F1" />
          <Text color="$secondaryText" marginTop="$2">
            Loading plans...
          </Text>
        </YStack>
      )}

      {plansError && (
        <Pressable
          onPress={() => {
            // Trigger re-authentication
            Alert.alert("Session Expired", "Please log in again to continue.", [{ text: "OK" }]);
          }}
        >
          <GlassyCard>
            <YStack padding="$5" alignItems="center" gap="$3">
              <Text fontSize={32}>🔐</Text>
              <Text color="$color" fontWeight="600" fontSize={16}>
                Session Expired
              </Text>
              <Text color="$secondaryText" fontSize={14} textAlign="center">
                Tap to re-authenticate and load your plans
              </Text>
              <Button size="$3" backgroundColor="$accentColor" color="white" marginTop="$2">
                Re-authenticate
              </Button>
            </YStack>
          </GlassyCard>
        </Pressable>
      )}

      {plans && plans.length === 0 && !plansLoading && (
        <GlassyCard>
          <YStack padding="$6" alignItems="center" gap="$4">
            <Text fontSize={48}>🚀</Text>
            <Text color="$color" fontWeight="bold" fontSize={18}>
              Select Your First Path
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Start building your financial plan
            </Text>
            <XStack gap="$3" marginTop="$2">
              <Button
                flex={1}
                size="$4"
                backgroundColor="$backgroundHover"
                borderWidth={1}
                borderColor="$borderColor"
                icon={<Pencil size={18} color="$color" />}
                onPress={() => setCreateSheetOpen(true)}
              >
                Manual
              </Button>
              <Button
                flex={1}
                size="$4"
                backgroundColor="$accentColor"
                color="white"
                icon={<FileSpreadsheet size={18} color="white" />}
                onPress={() => setCreateSheetOpen(true)}
              >
                Import CSV
              </Button>
            </XStack>
          </YStack>
        </GlassyCard>
      )}

      {plans?.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onPress={() => {
            setSelectedPlan(plan);
          }}
          onSetActive={plan.status !== "active" ? () => setActivePlan.mutate(plan.id) : undefined}
          onDelete={() => handleDeletePlan(plan.id)}
        />
      ))}
    </YStack>
  );

  // If a plan is selected, show the dashboard detail view
  if (selectedPlan) {
    return (
      <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
        {/* Back Header */}
        <XStack
          padding="$4"
          alignItems="center"
          gap="$3"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Pressable onPress={() => setSelectedPlan(null)}>
            <XStack alignItems="center" gap="$2">
              <ArrowLeft size={20} color="$accentColor" />
              <Text color="$accentColor" fontSize={14}>
                Plans
              </Text>
            </XStack>
          </Pressable>
        </XStack>

        {/* Plan Dashboard */}
        <PlanDashboard
          plan={selectedPlan}
          categoryGroups={selectedPlan.categoryGroups}
          onCategoryPress={(groupId: string) => {
            console.log("Category pressed:", groupId);
          }}
        />
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
          <H2 color="$color" fontSize={28} fontWeight="bold">
            Planning
          </H2>
          <Button
            size="$3"
            circular
            backgroundColor="$accentColor"
            icon={<Plus size={20} color="white" />}
            onPress={() => setCreateSheetOpen(true)}
          />
        </XStack>

        {/* Segment Control */}
        <XStack backgroundColor="$backgroundHover" borderRadius="$4" padding="$1" marginBottom="$6">
          {(["plans", "goals", "budgets", "recurring"] as TabType[]).map((tab) => (
            <Button
              key={tab}
              flex={1}
              size="$3"
              backgroundColor={activeTab === tab ? "$accentColor" : "transparent"}
              color={activeTab === tab ? "white" : "$secondaryText"}
              onPress={() => setActiveTab(tab)}
              borderRadius="$3"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </XStack>

        {/* Tab Content */}
        {activeTab === "plans" && renderPlans()}
        {activeTab === "goals" && renderGoals()}
        {activeTab === "budgets" && renderBudgets()}
        {activeTab === "recurring" && renderRecurring()}
      </ScrollView>

      {/* Create Plan Sheet */}
      <CreatePlanSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onPlanCreated={() => {
          // Refetch plans and the new one will appear in the list
          // User can then tap on it to see the dashboard
        }}
        initialCategories={importedCategories}
      />

      {/* Edit Budget Sheet */}
      <EditBudgetSheet
        open={editBudgetOpen}
        onOpenChange={setEditBudgetOpen}
        planId=""
        item={selectedBudgetItem}
        onBudgetUpdated={() => setEditBudgetOpen(false)}
      />

      {/* Edit Recurring Sheet */}
      <EditRecurringSheet
        open={editRecurringOpen}
        onOpenChange={setEditRecurringOpen}
        subscription={selectedSubscription}
        onSubscriptionUpdated={() => setEditRecurringOpen(false)}
      />
    </YStack>
  );
}
