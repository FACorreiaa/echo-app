/**
 * PlanWizardSheet - Multi-step wizard for creating and editing plans
 *
 * Steps:
 * 1. Structure - Define category groups and categories
 * 2. Budgets - Set budgets for Budget [B] and Recurring [R] items
 * 3. Goals - Set savings goals [S] with target amounts
 * 4. Review - Summary with income vs expenses and total impact
 */

import { GlassButton, GlassInput } from "@/components/GlassComponents";
import { GlassyCard } from "@/components/ui/GlassyCard";
import { useCreatePlan, usePlan, useUpdatePlanStructure } from "@/lib/hooks/use-plans";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Pencil,
  PiggyBank,
  Target,
  Wallet,
  X,
} from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import { Button, ScrollView, Sheet, Text, XStack, YStack } from "tamagui";

import { BuilderGroup, CategoryGroupBuilder, type ItemType } from "./CategoryGroupBuilder";
import { IncomeSpendingChart } from "./IncomeSpendingChart";

// ============================================================================
// Types
// ============================================================================

interface PlanWizardSheetProps {
  mode: "create" | "edit";
  planId?: string; // Required for edit mode
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: (planId: string) => void;
  /** Initial step to open on - for deep-linking from item types */
  initialStep?: WizardStep;
}

type WizardStep = "structure" | "budgets" | "goals" | "review";

const STEPS: WizardStep[] = ["structure", "budgets", "goals", "review"];

const STEP_INFO: Record<WizardStep, { title: string; icon: React.ReactNode; description: string }> =
  {
    structure: {
      title: "Structure",
      icon: <Pencil size={18} color="white" />,
      description: "Define your spending categories",
    },
    budgets: {
      title: "Budgets",
      icon: <Wallet size={18} color="white" />,
      description: "Set monthly spending limits",
    },
    goals: {
      title: "Goals",
      icon: <Target size={18} color="white" />,
      description: "Define savings targets",
    },
    review: {
      title: "Review",
      icon: <Check size={18} color="white" />,
      description: "Review and confirm your plan",
    },
  };

// ============================================================================
// Helpers
// ============================================================================

const formatMoney = (minor: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
  }).format(minor / 100);
};

// ============================================================================
// Component
// ============================================================================

export function PlanWizardSheet({
  mode,
  planId,
  open,
  onOpenChange,
  onComplete,
  initialStep,
}: PlanWizardSheetProps) {
  const { data: existingPlan, isLoading: _planLoading } = usePlan(planId ?? "");
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlanStructure();

  const [currentStep, setCurrentStep] = useState<WizardStep>(initialStep ?? "structure");
  const [planName, setPlanName] = useState("");
  const [builderGroups, setBuilderGroups] = useState<BuilderGroup[]>([]);

  // Initialize from existing plan in edit mode
  useEffect(() => {
    if (mode === "edit" && existingPlan && open) {
      setPlanName(existingPlan.name);
      const groups: BuilderGroup[] = existingPlan.categoryGroups.map((g) => ({
        id: g.id,
        name: g.name,
        color: g.color || "#22c55e",
        targetPercent: g.targetPercent,
        categories: g.categories.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          items: c.items.map((i) => ({
            id: i.id,
            name: i.name,
            budgetedMinor: Math.round(i.budgeted * 100),
            itemType: (i.itemType as ItemType) || "budget",
            configId: i.configId,
            initialActualMinor: i.itemType === "goal" ? Math.round(i.actual * 100) : undefined,
          })),
        })),
      }));
      setBuilderGroups(groups);
    } else if (mode === "create" && open) {
      // Reset for create mode
      setPlanName("");
      setBuilderGroups([]);
    }
  }, [existingPlan, mode, open]);

  // Reset step when opening - use initialStep if provided
  useEffect(() => {
    if (open) {
      setCurrentStep(initialStep ?? "structure");
    }
  }, [open, initialStep]);

  // ============================================================================
  // Calculations
  // ============================================================================

  const calculations = React.useMemo(() => {
    let incomeTotal = 0;
    let expenseTotal = 0;
    let savingsTotal = 0;
    let budgetCount = 0;
    let recurringCount = 0;
    let goalCount = 0;

    builderGroups.forEach((g) => {
      g.categories.forEach((c) => {
        c.items.forEach((i) => {
          const amount = i.budgetedMinor;
          switch (i.itemType) {
            case "income":
              incomeTotal += amount;
              break;
            case "goal":
              savingsTotal += amount;
              goalCount++;
              break;
            case "recurring":
              expenseTotal += amount;
              recurringCount++;
              break;
            default:
              expenseTotal += amount;
              budgetCount++;
              break;
          }
        });
      });
    });

    const surplus = incomeTotal - expenseTotal - savingsTotal;

    return {
      incomeTotal,
      expenseTotal,
      savingsTotal,
      surplus,
      budgetCount,
      recurringCount,
      goalCount,
      totalItems: budgetCount + recurringCount + goalCount,
    };
  }, [builderGroups]);

  // ============================================================================
  // Navigation
  // ============================================================================

  const currentStepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const goNext = () => {
    if (!isLastStep) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  };

  const goBack = () => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    }
  };

  const handleSave = async () => {
    if (!planName.trim()) {
      Alert.alert("Error", "Please enter a plan name.");
      return;
    }

    try {
      if (mode === "create") {
        const result = await createPlan.mutateAsync({
          name: planName,
          categoryGroups: builderGroups.map((g) => ({
            name: g.name,
            color: g.color,
            targetPercent: g.targetPercent,
            categories: g.categories.map((c) => ({
              name: c.name,
              icon: c.icon,
              items: c.items.map((i) => ({
                name: i.name,
                budgetedMinor: i.budgetedMinor,
                itemType: i.itemType,
                configId: i.configId,
                initialActualMinor: i.initialActualMinor,
              })),
            })),
          })),
        });
        onOpenChange(false);
        onComplete?.(result?.id ?? "");
        Alert.alert("Success", "Plan created successfully!");
      } else if (planId) {
        await updatePlan.mutateAsync({
          planId,
          categoryGroups: builderGroups.map((g) => ({
            id: g.id.startsWith("group_") ? undefined : g.id,
            name: g.name,
            color: g.color,
            targetPercent: g.targetPercent,
            categories: g.categories.map((c) => ({
              id: c.id.startsWith("cat_") ? undefined : c.id,
              name: c.name,
              icon: c.icon,
              items: c.items.map((i) => ({
                id: i.id.startsWith("item_") ? undefined : i.id,
                name: i.name,
                budgetedMinor: i.budgetedMinor,
                itemType: i.itemType,
                configId: i.configId,
                initialActualMinor: i.initialActualMinor,
              })),
            })),
          })),
        });
        onOpenChange(false);
        onComplete?.(planId);
        Alert.alert("Success", "Plan updated successfully!");
      }
    } catch (error) {
      console.error("Failed to save plan:", error);
      Alert.alert("Error", "Failed to save plan. Please try again.");
    }
  };

  const isPending = createPlan.isPending || updatePlan.isPending;

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[92]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius="$6" borderTopRightRadius="$6">
        <Sheet.Handle />

        <YStack flex={1} padding="$4">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <YStack>
              <Text color="$color" fontSize={24} fontWeight="bold">
                {mode === "create" ? "Create Plan" : "Edit Plan"}
              </Text>
              <Text color="$secondaryText" fontSize={14}>
                {STEP_INFO[currentStep].description}
              </Text>
            </YStack>
            <Pressable onPress={() => onOpenChange(false)}>
              <X size={24} color="$secondaryText" />
            </Pressable>
          </XStack>

          {/* Step Indicator */}
          <XStack gap="$2" marginBottom="$4">
            {STEPS.map((step, index) => {
              const isActive = currentStep === step;
              const isComplete = index < currentStepIndex;

              return (
                <Pressable key={step} onPress={() => setCurrentStep(step)} style={{ flex: 1 }}>
                  <YStack gap="$1">
                    <XStack
                      backgroundColor={
                        isActive ? "$accentColor" : isComplete ? "$green10" : "$backgroundHover"
                      }
                      padding="$2"
                      borderRadius="$3"
                      alignItems="center"
                      justifyContent="center"
                      gap="$1"
                    >
                      {isComplete ? (
                        <Check size={14} color="white" />
                      ) : (
                        <Text
                          color={isActive ? "white" : "$secondaryText"}
                          fontSize={12}
                          fontWeight="600"
                        >
                          {index + 1}
                        </Text>
                      )}
                    </XStack>
                    <Text
                      color={isActive ? "$color" : "$secondaryText"}
                      fontSize={10}
                      fontWeight={isActive ? "600" : "400"}
                      textAlign="center"
                    >
                      {STEP_INFO[step].title}
                    </Text>
                  </YStack>
                </Pressable>
              );
            })}
          </XStack>

          {/* Content */}
          <ScrollView flex={1} showsVerticalScrollIndicator={false}>
            {/* Step 1: Structure */}
            {currentStep === "structure" && (
              <YStack gap="$4">
                {/* Plan Name */}
                <GlassyCard>
                  <YStack padding="$4" gap="$2">
                    <Text color="$secondaryText" fontSize={12} fontWeight="600">
                      PLAN NAME
                    </Text>
                    <GlassInput
                      value={planName}
                      onChangeText={setPlanName}
                      placeholder="e.g. January 2026"
                      size="$5"
                    />
                  </YStack>
                </GlassyCard>

                {/* Category Builder */}
                <CategoryGroupBuilder groups={builderGroups} onChange={setBuilderGroups} />
              </YStack>
            )}

            {/* Step 2: Budgets */}
            {currentStep === "budgets" && (
              <YStack gap="$4">
                <GlassyCard>
                  <YStack padding="$4" gap="$3">
                    <XStack alignItems="center" gap="$2">
                      <Wallet size={20} color="$accentColor" />
                      <Text color="$color" fontWeight="700" fontSize={16}>
                        Budget Items
                      </Text>
                    </XStack>
                    <Text color="$secondaryText" fontSize={13}>
                      Set spending limits for variable expenses like groceries, dining,
                      entertainment.
                    </Text>
                    <XStack justifyContent="space-between" marginTop="$2">
                      <Text color="$secondaryText">Budget items:</Text>
                      <Text color="$color" fontWeight="600">
                        {calculations.budgetCount}
                      </Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text color="$secondaryText">Recurring items:</Text>
                      <Text color="$color" fontWeight="600">
                        {calculations.recurringCount}
                      </Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text color="$secondaryText">Total expenses:</Text>
                      <Text color="$color" fontWeight="700">
                        {formatMoney(calculations.expenseTotal)}
                      </Text>
                    </XStack>
                  </YStack>
                </GlassyCard>

                {/* Embedded builder for editing amounts */}
                <CategoryGroupBuilder groups={builderGroups} onChange={setBuilderGroups} />
              </YStack>
            )}

            {/* Step 3: Goals */}
            {currentStep === "goals" && (
              <YStack gap="$4">
                <GlassyCard>
                  <YStack padding="$4" gap="$3">
                    <XStack alignItems="center" gap="$2">
                      <Target size={20} color="#22c55e" />
                      <Text color="$color" fontWeight="700" fontSize={16}>
                        Savings Goals
                      </Text>
                    </XStack>
                    <Text color="$secondaryText" fontSize={13}>
                      Set targets for your savings. See how they impact your monthly surplus.
                    </Text>
                    <XStack justifyContent="space-between" marginTop="$2">
                      <Text color="$secondaryText">Goal items:</Text>
                      <Text color="$color" fontWeight="600">
                        {calculations.goalCount}
                      </Text>
                    </XStack>
                    <XStack justifyContent="space-between">
                      <Text color="$secondaryText">Total goal amount:</Text>
                      <Text color="#22c55e" fontWeight="700">
                        {formatMoney(calculations.savingsTotal)}
                      </Text>
                    </XStack>
                  </YStack>
                </GlassyCard>

                {/* Total Impact Preview */}
                <GlassyCard>
                  <YStack padding="$4" gap="$3">
                    <XStack alignItems="center" gap="$2">
                      <PiggyBank size={20} color="$accentColor" />
                      <Text color="$color" fontWeight="700" fontSize={16}>
                        Total Impact
                      </Text>
                    </XStack>

                    <YStack gap="$2" marginTop="$2">
                      <XStack justifyContent="space-between">
                        <Text color="$secondaryText">Income:</Text>
                        <Text color="$color" fontWeight="600">
                          {formatMoney(calculations.incomeTotal)}
                        </Text>
                      </XStack>
                      <XStack justifyContent="space-between">
                        <Text color="$secondaryText">Expenses:</Text>
                        <Text color="$color" fontWeight="600">
                          -{formatMoney(calculations.expenseTotal)}
                        </Text>
                      </XStack>
                      <XStack justifyContent="space-between">
                        <Text color="$secondaryText">Savings Goals:</Text>
                        <Text color="#22c55e" fontWeight="600">
                          -{formatMoney(calculations.savingsTotal)}
                        </Text>
                      </XStack>
                      <XStack
                        justifyContent="space-between"
                        paddingTop="$2"
                        borderTopWidth={1}
                        borderTopColor="$borderColor"
                      >
                        <Text color="$color" fontWeight="700">
                          Monthly Surplus:
                        </Text>
                        <Text
                          color={calculations.surplus >= 0 ? "$green10" : "$red10"}
                          fontWeight="700"
                          fontSize={18}
                        >
                          {formatMoney(calculations.surplus)}
                        </Text>
                      </XStack>
                    </YStack>
                  </YStack>
                </GlassyCard>

                {/* Builder for goals */}
                <CategoryGroupBuilder groups={builderGroups} onChange={setBuilderGroups} />
              </YStack>
            )}

            {/* Step 4: Review */}
            {currentStep === "review" && (
              <YStack gap="$4">
                {/* Plan Summary */}
                <GlassyCard>
                  <YStack padding="$4" gap="$4">
                    <Text color="$color" fontWeight="700" fontSize={18}>
                      {planName || "Untitled Plan"}
                    </Text>

                    <XStack gap="$4" flexWrap="wrap">
                      <YStack flex={1} minWidth={100}>
                        <Text color="$secondaryText" fontSize={11}>
                          Categories
                        </Text>
                        <Text color="$color" fontWeight="700" fontSize={20}>
                          {builderGroups.reduce((sum, g) => sum + g.categories.length, 0)}
                        </Text>
                      </YStack>
                      <YStack flex={1} minWidth={100}>
                        <Text color="$secondaryText" fontSize={11}>
                          Items
                        </Text>
                        <Text color="$color" fontWeight="700" fontSize={20}>
                          {calculations.totalItems}
                        </Text>
                      </YStack>
                    </XStack>
                  </YStack>
                </GlassyCard>

                {/* Income vs Spending Chart */}
                <IncomeSpendingChart
                  incomeTotal={calculations.incomeTotal}
                  expenseTotal={calculations.expenseTotal}
                  savingsTotal={calculations.savingsTotal}
                  currencyCode="EUR"
                />

                {/* Final Summary */}
                <GlassyCard>
                  <YStack padding="$4" gap="$3">
                    <Text color="$color" fontWeight="700" fontSize={16}>
                      Financial Summary
                    </Text>

                    <YStack gap="$2">
                      <XStack justifyContent="space-between">
                        <Text color="$secondaryText">Total Income:</Text>
                        <Text color="$color" fontWeight="600">
                          {formatMoney(calculations.incomeTotal)}
                        </Text>
                      </XStack>
                      <XStack justifyContent="space-between">
                        <Text color="$secondaryText">Total Expenses:</Text>
                        <Text color="$color" fontWeight="600">
                          {formatMoney(calculations.expenseTotal)}
                        </Text>
                      </XStack>
                      <XStack justifyContent="space-between">
                        <Text color="$secondaryText">Total Savings:</Text>
                        <Text color="#22c55e" fontWeight="600">
                          {formatMoney(calculations.savingsTotal)}
                        </Text>
                      </XStack>
                      <XStack
                        justifyContent="space-between"
                        paddingTop="$2"
                        borderTopWidth={1}
                        borderTopColor="$borderColor"
                      >
                        <Text color="$color" fontWeight="700">
                          Net Surplus:
                        </Text>
                        <Text
                          color={calculations.surplus >= 0 ? "$green10" : "$red10"}
                          fontWeight="700"
                          fontSize={18}
                        >
                          {formatMoney(calculations.surplus)}
                        </Text>
                      </XStack>
                    </YStack>

                    {calculations.surplus < 0 && (
                      <XStack backgroundColor="$red2" padding="$3" borderRadius="$3" marginTop="$2">
                        <Text color="$red11" fontSize={12}>
                          ⚠️ Your expenses and savings exceed your income by{" "}
                          {formatMoney(Math.abs(calculations.surplus))}. Consider adjusting your
                          budget.
                        </Text>
                      </XStack>
                    )}
                  </YStack>
                </GlassyCard>
              </YStack>
            )}
          </ScrollView>

          {/* Footer Navigation */}
          <XStack gap="$3" marginTop="$4">
            {!isFirstStep && (
              <Button
                flex={1}
                backgroundColor="$backgroundHover"
                borderWidth={1}
                borderColor="$borderColor"
                onPress={goBack}
              >
                <ArrowLeft size={16} color="$color" />
                <Text color="$color">Back</Text>
              </Button>
            )}

            {isLastStep ? (
              <GlassButton
                flex={2}
                onPress={handleSave}
                disabled={isPending || !planName.trim()}
                backgroundColor="$accentColor"
              >
                <Text color="white" fontWeight="600">
                  {isPending ? "Saving..." : mode === "create" ? "Create Plan" : "Save Changes"}
                </Text>
              </GlassButton>
            ) : (
              <GlassButton
                flex={isFirstStep ? 1 : 2}
                onPress={goNext}
                backgroundColor="$accentColor"
              >
                <Text color="white" fontWeight="600">
                  Next
                </Text>
                <ArrowRight size={16} color="white" />
              </GlassButton>
            )}
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
