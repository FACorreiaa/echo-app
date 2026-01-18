import { ArrowLeft, FileSpreadsheet, Pencil, Plus, Settings } from "@tamagui/lucide-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Progress, Text, XStack, YStack } from "tamagui";

import { CircularBudgetGrid } from "@/components/ui";
import { GlassyCard } from "@/components";
import { calcProgress, formatMoney, usePlanItemsByTab } from "@/lib/hooks/use-plan-items-by-tab";
import {
  useDeletePlan,
  usePlan,
  usePlans,
  useSetActivePlan,
  type PlanItem,
} from "@/lib/hooks/use-plans";
import { useSubscriptions, type Subscription } from "@/lib/hooks/use-subscriptions";
import { useActivePlanStore } from "@/lib/stores/use-active-plan-store";
import {
  ActivePlanHeader,
  BudgetCard,
  CreatePlanSheet,
  EditBudgetSheet,
  EditRecurringSheet,
  GoalCard,
  ItemTypesSheet,
  PlanCard,
  PlanDashboard,
  PlanWizardSheet,
  RecurringCard,
} from "@/widgets/planning";

// Format next date for subscription
function formatNextDate(date: Date | null) {
  if (!date) return "Unknown";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type TabType = "plans" | "goals" | "budgets" | "recurring";

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("plans");
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  // Edit sheet state
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [editRecurringOpen, setEditRecurringOpen] = useState(false);
  const [itemTypesOpen, setItemTypesOpen] = useState(false);
  const [selectedBudgetItem, setSelectedBudgetItem] = useState<PlanItem | null>(null);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [createWizardOpen, setCreateWizardOpen] = useState(false);

  // Plans from API - FIRST to get active plan
  const { data: plans, isLoading: plansLoading, error: plansError } = usePlans();
  // Get the active plan from the list
  const activePlanData = plans?.find((p) => p.status === "active") ?? null;
  const { setActivePlanId } = useActivePlanStore();

  // Sync active plan to store
  useEffect(() => {
    if (activePlanData?.id) {
      setActivePlanId(activePlanData.id);
    }
  }, [activePlanData?.id, setActivePlanId]);

  // Filtered queries for tabs - DEPEND on activePlanData
  const { data: budgetData, isLoading: budgetItemsLoading } = usePlanItemsByTab(
    activePlanData?.id ?? null,
    "budgets",
  );
  const { data: recurringData, isLoading: recurringItemsLoading } = usePlanItemsByTab(
    activePlanData?.id ?? null,
    "recurring",
  );
  const { data: goalData, isLoading: goalItemsLoading } = usePlanItemsByTab(
    activePlanData?.id ?? null,
    "goals",
  );

  // Subscriptions from API (legacy/other)
  const { data: subsData } = useSubscriptions("active");
  const subscriptions = subsData?.subscriptions ?? [];

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

  const { data: selectedPlan, isLoading: planDetailsLoading } = usePlan(selectedPlanId ?? "");
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
      {/* Global Progress Header */}
      {activePlanData && (
        <GlassyCard>
          <YStack padding="$4" gap="$2">
            <Text color="$color" fontWeight="600">
              Goal Progress
            </Text>
            <XStack justifyContent="space-between">
              <Text color="$secondaryText">Target</Text>
              <Text color="$color" fontWeight="bold">
                {formatMoney(goalData?.totalBudgetedMinor ?? BigInt(0))}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$secondaryText">Saved</Text>
              <Text color="#22c55e" fontWeight="bold">
                {formatMoney(goalData?.totalActualMinor ?? BigInt(0))}
              </Text>
            </XStack>
            <Progress
              value={calcProgress(
                goalData?.totalActualMinor ?? BigInt(0),
                goalData?.totalBudgetedMinor ?? BigInt(0),
              )}
              backgroundColor="$backgroundHover"
              marginTop="$2"
            >
              <Progress.Indicator backgroundColor="#22c55e" />
            </Progress>
          </YStack>
        </GlassyCard>
      )}

      <Text color="$color" fontSize={18} fontWeight="bold">
        Active Goals
      </Text>
      {goalItemsLoading ? (
        <YStack alignItems="center" padding="$6">
          <ActivityIndicator color="#6366F1" />
          <Text color="$secondaryText" marginTop="$2">
            Loading goals...
          </Text>
        </YStack>
      ) : !goalData?.items || goalData.items.length === 0 ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>🎯</Text>
            <Text color="$color" fontWeight="600">
              No Goals Yet
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Create your first savings goal in your plan structure
            </Text>
            <Button
              marginTop="$2"
              backgroundColor="$accentColor"
              onPress={() => setEditPlanOpen(true)}
            >
              <Pencil size={16} color="white" />
              <Text color="white">Edit Plan</Text>
            </Button>
          </YStack>
        </GlassyCard>
      ) : (
        goalData.items.map((goal) => <GoalCard key={goal.id} goal={goal} />)
      )}

      <Text color="$color" fontSize={18} fontWeight="bold">
        Active Goals
      </Text>
      {goalItemsLoading ? (
        <YStack alignItems="center" padding="$6">
          <ActivityIndicator color="#6366F1" />
          <Text color="$secondaryText" marginTop="$2">
            Loading goals...
          </Text>
        </YStack>
      ) : !goalData?.items || goalData.items.length === 0 ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>🎯</Text>
            <Text color="$color" fontWeight="600">
              No Goals Yet
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Create your first savings goal in your plan structure
            </Text>
            <Button
              marginTop="$2"
              backgroundColor="$accentColor"
              onPress={() => setEditPlanOpen(true)}
            >
              <Pencil size={16} color="white" />
              <Text color="white">Edit Plan</Text>
            </Button>
          </YStack>
        </GlassyCard>
      ) : (
        goalData.items.map((goal) => <GoalCard key={goal.id} goal={goal} />)
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

  /* Removed derived activePlan/budgets here */

  const renderBudgets = () => (
    <YStack gap="$4">
      {/* Circular Budget Overview - Like Copilot mobile */}
      {activePlanData && budgetData?.items && budgetData.items.length > 0 && (
        <>
          <Text color="$color" fontSize={12} fontWeight="700" letterSpacing={1} marginBottom="$2">
            BUDGET CATEGORIES
          </Text>
          <CircularBudgetGrid
            budgets={budgetData.items.slice(0, 8).map((item) => ({
              category: item.name,
              spent: Number(item.actualMinor) / 100,
              budgeted: Number(item.budgetedMinor) / 100,
            }))}
            columns={4}
            size={70}
          />
        </>
      )}

      {/* Global Progress Header */}
      {activePlanData && (
        <GlassyCard marginTop="$4">
          <YStack padding="$4" gap="$2">
            <Text color="$color" fontWeight="700" fontSize={14} letterSpacing={0.5}>
              TOTAL BUDGET
            </Text>
            <XStack justifyContent="space-between">
              <Text color="$secondaryText" fontSize={11} letterSpacing={0.5}>
                BUDGETED
              </Text>
              <Text color="$color" fontWeight="bold" letterSpacing={0.3}>
                {formatMoney(budgetData?.totalBudgetedMinor ?? BigInt(0))}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$secondaryText" fontSize={11} letterSpacing={0.5}>
                SPENT
              </Text>
              <Text color="$color" fontWeight="bold" letterSpacing={0.3}>
                {formatMoney(budgetData?.totalActualMinor ?? BigInt(0))}
              </Text>
            </XStack>
            <Progress
              value={calcProgress(
                budgetData?.totalActualMinor ?? BigInt(0),
                budgetData?.totalBudgetedMinor ?? BigInt(0),
              )}
              backgroundColor="$backgroundHover"
              marginTop="$2"
            >
              <Progress.Indicator
                backgroundColor={
                  Number(budgetData?.totalActualMinor ?? 0) >
                  Number(budgetData?.totalBudgetedMinor ?? 0)
                    ? "#ef4444"
                    : "$accentColor"
                }
              />
            </Progress>
            <XStack justifyContent="flex-end">
              <Text color="$secondaryText" fontSize={11} letterSpacing={0.5}>
                {formatMoney(
                  (budgetData?.totalBudgetedMinor ?? BigInt(0)) -
                    (budgetData?.totalActualMinor ?? BigInt(0)),
                )}{" "}
                REMAINING
              </Text>
            </XStack>
          </YStack>
        </GlassyCard>
      )}

      <Text color="$color" fontSize={13} fontWeight="700" letterSpacing={1} marginTop="$4">
        MONTHLY BUDGETS
      </Text>
      {budgetItemsLoading ? (
        <YStack alignItems="center" padding="$6">
          <ActivityIndicator color="#6366F1" />
          <Text color="$secondaryText" marginTop="$2">
            Loading budgets...
          </Text>
        </YStack>
      ) : !activePlanData ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>📊</Text>
            <Text color="$color" fontWeight="600">
              No Active Plan
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Create a financial plan to set monthly budgets
            </Text>
            <Button
              marginTop="$2"
              backgroundColor="$accentColor"
              onPress={() => setCreateSheetOpen(true)}
            >
              <Plus size={16} color="white" />
              <Text color="white">Create Plan</Text>
            </Button>
          </YStack>
        </GlassyCard>
      ) : !budgetData?.items || budgetData.items.length === 0 ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>💰</Text>
            <Text color="$color" fontWeight="600">
              No Budgets Defined
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Your active plan "{activePlanData.name}" has no budget items yet. Tap to go to Plans
              and edit your budget structure.
            </Text>
            <Button
              marginTop="$2"
              backgroundColor="$accentColor"
              onPress={() => setEditPlanOpen(true)}
            >
              <Pencil size={16} color="white" />
              <Text color="white">Edit Plan</Text>
            </Button>
          </YStack>
        </GlassyCard>
      ) : (
        budgetData.items.map((budget) => (
          <BudgetCard
            key={budget.id}
            item={budget}
            onPress={() => {
              setSelectedBudgetItem({
                id: budget.id,
                name: budget.name,
                budgeted: Number(budget.budgetedMinor) / 100,
                actual: Number(budget.actualMinor) / 100,
                widgetType: "input",
                fieldType: "currency",
                labels: {},
              });
              setEditBudgetOpen(true);
            }}
          />
        ))
      )}
    </YStack>
  );

  const renderRecurring = () => (
    <YStack gap="$4">
      {/* Global Progress Header */}
      {activePlanData && (
        <GlassyCard>
          <YStack padding="$4" gap="$2">
            <Text color="$color" fontWeight="600">
              Recurring Expenses
            </Text>
            <XStack justifyContent="space-between">
              <Text color="$secondaryText">Committed</Text>
              <Text color="$color" fontWeight="bold">
                {formatMoney(recurringData?.totalBudgetedMinor ?? BigInt(0))}
              </Text>
            </XStack>
            <XStack justifyContent="space-between">
              <Text color="$secondaryText">Paid</Text>
              <Text color="$color" fontWeight="bold">
                {formatMoney(recurringData?.totalActualMinor ?? BigInt(0))}
              </Text>
            </XStack>
            <Progress
              value={calcProgress(
                recurringData?.totalActualMinor ?? BigInt(0),
                recurringData?.totalBudgetedMinor ?? BigInt(0),
              )}
              backgroundColor="$backgroundHover"
              marginTop="$2"
            >
              <Progress.Indicator backgroundColor="$accentColor" />
            </Progress>
          </YStack>
        </GlassyCard>
      )}

      <Text color="$color" fontSize={18} fontWeight="bold">
        Recurring Subscriptions
      </Text>
      {recurringItemsLoading ? (
        <YStack alignItems="center" padding="$6">
          <ActivityIndicator color="#6366F1" />
          <Text color="$secondaryText" marginTop="$2">
            Loading updated items...
          </Text>
        </YStack>
      ) : (!recurringData?.items || recurringData.items.length === 0) &&
        subscriptions.length === 0 ? (
        <GlassyCard>
          <YStack padding="$5" alignItems="center" gap="$3">
            <Text fontSize={32}>📺</Text>
            <Text color="$color" fontWeight="600">
              No Subscriptions
            </Text>
            <Text color="$secondaryText" textAlign="center" fontSize={14}>
              Import transactions to auto-detect recurring charges, or add recurring expenses to
              your plan structure.
            </Text>
            <XStack gap="$2" marginTop="$2">
              {activePlanData && (
                <Button
                  backgroundColor="$backgroundHover"
                  borderWidth={1}
                  borderColor="$borderColor"
                  onPress={() => setEditPlanOpen(true)}
                >
                  <Pencil size={14} color="$color" />
                  <Text color="$color">Edit Plan</Text>
                </Button>
              )}
            </XStack>
          </YStack>
        </GlassyCard>
      ) : (
        <>
          {/* Render Plan Items first */}
          {recurringData?.items.map((item) => (
            <RecurringCard key={item.id} item={item} />
          ))}

          {/* Render Subscriptions (Legacy) */}
          {subscriptions.map((sub: Subscription) => (
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
          ))}
        </>
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
                onPress={() => setCreateWizardOpen(true)}
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
            setSelectedPlanId(plan.id);
          }}
          onSetActive={plan.status !== "active" ? () => setActivePlan.mutate(plan.id) : undefined}
          onDelete={() => handleDeletePlan(plan.id)}
        />
      ))}
    </YStack>
  );

  // If a plan is selected, show the dashboard detail view
  if (selectedPlanId) {
    // Show loading while fetching full plan details
    if (planDetailsLoading || !selectedPlan) {
      return (
        <YStack
          flex={1}
          backgroundColor="$background"
          paddingTop={insets.top}
          justifyContent="center"
          alignItems="center"
        >
          <ActivityIndicator size="large" />
          <Text color="$secondaryText" marginTop="$2">
            Loading plan details...
          </Text>
        </YStack>
      );
    }

    return (
      <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
        {/* Back Header */}
        <XStack
          padding="$4"
          alignItems="center"
          justifyContent="space-between"
          borderBottomWidth={1}
          borderBottomColor="$borderColor"
        >
          <Pressable onPress={() => setSelectedPlanId(null)}>
            <XStack alignItems="center" gap="$2">
              <ArrowLeft size={20} color="$accentColor" />
              <Text color="$accentColor" fontSize={14}>
                Plans
              </Text>
            </XStack>
          </Pressable>

          <Button size="$3" chromeless onPress={() => setEditPlanOpen(true)}>
            <Pencil size={18} color="$accentColor" />
          </Button>
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
          <XStack gap="$2">
            <Button
              size="$3"
              circular
              backgroundColor="$backgroundHover"
              icon={<Settings size={18} color="$secondaryText" />}
              onPress={() => setItemTypesOpen(true)}
            />
            <Button
              size="$3"
              circular
              backgroundColor="$accentColor"
              icon={<Plus size={20} color="white" />}
              onPress={() => setCreateSheetOpen(true)}
            />
          </XStack>
        </XStack>

        {/* System Health */}
        <ActivePlanHeader />

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

      {/* Create Plan Sheet (for Excel import) */}
      <CreatePlanSheet
        open={createSheetOpen}
        onOpenChange={setCreateSheetOpen}
        onPlanCreated={() => {
          // Refetch plans and the new one will appear in the list
        }}
        initialCategories={importedCategories}
      />

      {/* Create Plan Wizard (for manual creation via stepper) */}
      <PlanWizardSheet
        mode="create"
        open={createWizardOpen}
        onOpenChange={setCreateWizardOpen}
        onComplete={(planId) => {
          setSelectedPlanId(planId);
        }}
      />

      {/* Edit Plan Wizard */}
      {selectedPlanId && (
        <PlanWizardSheet
          mode="edit"
          planId={selectedPlanId}
          open={editPlanOpen}
          onOpenChange={setEditPlanOpen}
        />
      )}
      {/* Also support editing active plan if no plan is selected/viewed */}
      {!selectedPlanId && activePlanData && (
        <PlanWizardSheet
          mode="edit"
          planId={activePlanData.id}
          open={editPlanOpen}
          onOpenChange={setEditPlanOpen}
        />
      )}

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

      {/* Item Types Sheet */}
      <ItemTypesSheet open={itemTypesOpen} onOpenChange={setItemTypesOpen} />
    </YStack>
  );
}
