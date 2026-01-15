/**
 * ReplicatePlanSheet - Smart Plan Replication
 *
 * Features:
 * 1. Persistent vs Variable categorization (Recurring=locked, Budget=review)
 * 2. Ghost Templates - Suggests missing recurring items from previous plans
 * 3. Variance indicators - Shows how last month's spending differed from budget
 * 4. Rollover surplus - Option to add surplus to savings goals
 */

import { GlassButton, GlassInput } from "@/components/GlassComponents";
import { GlassyCard } from "@/components/ui/GlassyCard";
import { usePlan, usePlans, useReplicatePlan } from "@/lib/hooks/use-plans";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Ghost,
  Lock,
  TrendingDown,
  TrendingUp,
  X,
} from "@tamagui/lucide-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable } from "react-native";
import { Input, ScrollView, Separator, Sheet, Switch, Text, XStack, YStack } from "tamagui";

interface ReplicatePlanSheetProps {
  sourcePlanId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPlanCreated?: (planId: string) => void;
}

type ItemStatus = "locked" | "review" | "ghost" | "new";
type ItemType = "budget" | "recurring" | "goal" | "income" | "investment" | "debt";

interface DiffItem {
  id: string;
  name: string;
  amount: number; // Minor units
  type: ItemType;
  status: ItemStatus;
  originalAmount: number;
  variance?: number; // Percentage variance from last month's actual
  actualLastMonth?: number; // Actual spending last month
  isGhost?: boolean; // Suggested from previous plans
  include: boolean; // Whether to include in new plan
}

// Format currency
function formatMoney(minor: number, currencyCode = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(minor / 100);
}

// Get item type label
function getItemTypeLabel(type: ItemType): string {
  const labels: Record<ItemType, string> = {
    budget: "Variable",
    recurring: "Fixed",
    goal: "Savings",
    income: "Income",
    investment: "Investment",
    debt: "Debt",
  };
  return labels[type] || type;
}

// Get item type color
function getItemTypeColor(type: ItemType): string {
  const colors: Record<ItemType, string> = {
    budget: "#f59e0b",
    recurring: "#6366f1",
    goal: "#22c55e",
    income: "#2da6fa",
    investment: "#8b5cf6",
    debt: "#ef4444",
  };
  return colors[type] || "#9ca3af";
}

export function ReplicatePlanSheet({
  sourcePlanId,
  open,
  onOpenChange,
  onPlanCreated,
}: ReplicatePlanSheetProps) {
  const { data: sourcePlan } = usePlan(sourcePlanId);
  const { data: allPlans } = usePlans();
  const replicatePlan = useReplicatePlan();

  const [date, setDate] = useState(new Date());
  const [targetName, setTargetName] = useState("");
  const [applySurplus, setApplySurplus] = useState(false);
  const [diffItems, setDiffItems] = useState<DiffItem[]>([]);
  const [showGhostSuggestions, setShowGhostSuggestions] = useState(true);

  // Find ghost items from previous plans (recurring items not in current plan)
  const ghostItems = useMemo(() => {
    if (!allPlans || !sourcePlan) return [];

    const currentItemNames = new Set<string>();
    sourcePlan.categoryGroups.forEach((g) => {
      g.categories.forEach((c) => {
        c.items.forEach((i) => {
          if (i.itemType === "recurring" || i.itemType === "income") {
            currentItemNames.add(i.name.toLowerCase());
          }
        });
      });
    });

    // Look at previous 3 plans for recurring items
    const ghosts: DiffItem[] = [];
    const seenNames = new Set<string>();

    allPlans
      .filter((p) => p.id !== sourcePlanId)
      .slice(0, 3)
      .forEach((plan) => {
        plan.categoryGroups?.forEach((g) => {
          g.categories?.forEach((c) => {
            c.items?.forEach((i) => {
              const nameLower = i.name.toLowerCase();
              if (
                (i.itemType === "recurring" || i.itemType === "income") &&
                !currentItemNames.has(nameLower) &&
                !seenNames.has(nameLower)
              ) {
                seenNames.add(nameLower);
                ghosts.push({
                  id: `ghost_${i.id}`,
                  name: i.name,
                  amount: i.budgeted * 100,
                  type: (i.itemType as ItemType) || "recurring",
                  status: "ghost",
                  originalAmount: i.budgeted * 100,
                  isGhost: true,
                  include: false,
                });
              }
            });
          });
        });
      });

    return ghosts;
  }, [allPlans, sourcePlan, sourcePlanId]);

  // Initialize diff items from source plan
  useEffect(() => {
    if (sourcePlan && open) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setDate(nextMonth);

      const monthName = nextMonth.toLocaleString("default", { month: "long", year: "numeric" });
      setTargetName(`${monthName} Plan`);

      const items: DiffItem[] = [];
      sourcePlan.categoryGroups.forEach((g) => {
        g.categories.forEach((c) => {
          c.items.forEach((i) => {
            const budgetedMinor = i.budgeted * 100;
            const actualMinor = (i.actual ?? 0) * 100;

            // Calculate variance
            let variance: number | undefined;
            if (budgetedMinor > 0 && actualMinor > 0) {
              variance = ((actualMinor - budgetedMinor) / budgetedMinor) * 100;
            }

            // Determine status based on type
            let status: ItemStatus = "review";
            const itemType = i.itemType as string;
            if (itemType === "recurring" || itemType === "income" || itemType === "debt") {
              status = "locked";
            }

            items.push({
              id: i.id,
              name: i.name,
              amount: budgetedMinor,
              type: (i.itemType as ItemType) || "budget",
              status,
              originalAmount: budgetedMinor,
              variance,
              actualLastMonth: actualMinor,
              isGhost: false,
              include: true,
            });
          });
        });
      });

      // Add ghost suggestions
      setDiffItems([...items, ...ghostItems]);
    }
  }, [sourcePlan, open, ghostItems]);

  // Calculations
  const calculations = useMemo(() => {
    const includedItems = diffItems.filter((i) => i.include);
    const totalBudget = includedItems.reduce((sum, i) => sum + i.amount, 0);
    const lockedTotal = includedItems
      .filter((i) => i.status === "locked")
      .reduce((sum, i) => sum + i.amount, 0);
    const reviewTotal = includedItems
      .filter((i) => i.status === "review")
      .reduce((sum, i) => sum + i.amount, 0);
    const ghostTotal = includedItems.filter((i) => i.isGhost).reduce((sum, i) => sum + i.amount, 0);

    return { totalBudget, lockedTotal, reviewTotal, ghostTotal };
  }, [diffItems]);

  const handleReplicate = async () => {
    if (!targetName.trim()) {
      Alert.alert("Error", "Please enter a plan name.");
      return;
    }

    try {
      const result = await replicatePlan.mutateAsync({
        sourcePlanId,
        targetDate: date,
        newName: targetName,
        // Note: itemOverrides would be passed to backend when API supports it
        applySurplusToSavingsId: applySurplus ? "first-goal" : undefined,
      });

      onOpenChange(false);
      onPlanCreated?.(result?.id ?? "");
      Alert.alert("Success", `Created ${targetName} from ${sourcePlan?.name}`);
    } catch (error) {
      console.error("Replication failed:", error);
      Alert.alert("Error", "Failed to create plan.");
    }
  };

  const handleUpdateItem = (id: string, updates: Partial<DiffItem>) => {
    setDiffItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  };

  const toggleItemInclude = (id: string) => {
    handleUpdateItem(id, { include: !diffItems.find((i) => i.id === id)?.include });
  };

  if (!sourcePlan) return null;

  // Group items by category
  const lockedItems = diffItems.filter((i) => i.status === "locked" && !i.isGhost);
  const reviewItems = diffItems.filter((i) => i.status === "review" && !i.isGhost);
  const ghostSuggestions = diffItems.filter((i) => i.isGhost);

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[92]} dismissOnSnapToBottom>
      <Sheet.Overlay />
      <Sheet.Frame
        backgroundColor="$background"
        padding="$4"
        borderTopLeftRadius="$6"
        borderTopRightRadius="$6"
      >
        <Sheet.Handle />

        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center" marginTop="$4" marginBottom="$2">
          <YStack>
            <Text color="$color" fontSize={24} fontWeight="bold">
              Smart Replicate
            </Text>
            <Text color="$secondaryText" fontSize={13}>
              From {sourcePlan.name}
            </Text>
          </YStack>
          <Pressable onPress={() => onOpenChange(false)} testID="close-button">
            <X size={24} color="$secondaryText" />
          </Pressable>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$4">
            {/* Target Settings */}
            <GlassyCard>
              <YStack padding="$4" gap="$3">
                <XStack justifyContent="space-between" alignItems="center">
                  <YStack gap="$1">
                    <Text color="$secondaryText" fontSize={11} fontWeight="600">
                      TARGET PERIOD
                    </Text>
                    <Text color="$color" fontSize={18} fontWeight="600">
                      {date.toLocaleString("default", { month: "long", year: "numeric" })}
                    </Text>
                  </YStack>
                  <YStack gap="$1" alignItems="flex-end">
                    <Text color="$secondaryText" fontSize={11} fontWeight="600">
                      ESTIMATED TOTAL
                    </Text>
                    <Text color="$accentColor" fontSize={18} fontWeight="700">
                      {formatMoney(calculations.totalBudget)}
                    </Text>
                  </YStack>
                </XStack>

                <GlassInput
                  value={targetName}
                  onChangeText={setTargetName}
                  placeholder="Plan name..."
                  testID="plan-name-input"
                />
              </YStack>
            </GlassyCard>

            {/* Rollover Surplus */}
            {sourcePlan.surplus > 0 && (
              <GlassyCard>
                <XStack padding="$3" alignItems="center" justifyContent="space-between">
                  <XStack gap="$3" alignItems="center" flex={1}>
                    <YStack backgroundColor="$green3" padding="$2" borderRadius="$3">
                      <ArrowRight size={16} color="$green11" />
                    </YStack>
                    <YStack flex={1}>
                      <Text color="$color" fontWeight="600">
                        Rollover Surplus
                      </Text>
                      <Text color="$secondaryText" fontSize={12}>
                        {formatMoney(sourcePlan.surplus * 100)} available from last month
                      </Text>
                    </YStack>
                  </XStack>
                  <Switch
                    size="$3"
                    checked={applySurplus}
                    onCheckedChange={setApplySurplus}
                    testID="surplus-toggle"
                  >
                    <Switch.Thumb animation="bouncy" />
                  </Switch>
                </XStack>
              </GlassyCard>
            )}

            {/* Fixed/Persistent Items */}
            {lockedItems.length > 0 && (
              <YStack gap="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <Lock size={14} color="$secondaryText" />
                    <Text color="$secondaryText" fontSize={12} fontWeight="600">
                      FIXED ITEMS ({lockedItems.length})
                    </Text>
                  </XStack>
                  <Text color="$secondaryText" fontSize={12}>
                    {formatMoney(calculations.lockedTotal)}
                  </Text>
                </XStack>

                {lockedItems.map((item) => (
                  <DiffItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItemInclude(item.id)}
                    onUpdateAmount={(amount) => handleUpdateItem(item.id, { amount })}
                  />
                ))}
              </YStack>
            )}

            {/* Variable/Review Items */}
            {reviewItems.length > 0 && (
              <YStack gap="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <AlertTriangle size={14} color={"#f97316" as any} />
                    <Text color={"#f97316" as any} fontSize={12} fontWeight="600">
                      VARIABLE - REVIEW ({reviewItems.length})
                    </Text>
                  </XStack>
                  <Text color="$secondaryText" fontSize={12}>
                    {formatMoney(calculations.reviewTotal)}
                  </Text>
                </XStack>

                {reviewItems.map((item) => (
                  <DiffItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItemInclude(item.id)}
                    onUpdateAmount={(amount) => handleUpdateItem(item.id, { amount })}
                  />
                ))}
              </YStack>
            )}

            {/* Ghost Suggestions */}
            {ghostSuggestions.length > 0 && showGhostSuggestions && (
              <YStack gap="$2">
                <XStack justifyContent="space-between" alignItems="center">
                  <XStack gap="$2" alignItems="center">
                    <Ghost size={14} color={"#a855f7" as any} />
                    <Text color={"#a855f7" as any} fontSize={12} fontWeight="600">
                      SUGGESTED FROM HISTORY ({ghostSuggestions.length})
                    </Text>
                  </XStack>
                  <Pressable onPress={() => setShowGhostSuggestions(false)}>
                    <Text color="$secondaryText" fontSize={11}>
                      Hide
                    </Text>
                  </Pressable>
                </XStack>

                <Text color="$secondaryText" fontSize={12} marginBottom="$1">
                  These items were in previous plans but not in the current one.
                </Text>

                {ghostSuggestions.map((item) => (
                  <DiffItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItemInclude(item.id)}
                    onUpdateAmount={(amount) => handleUpdateItem(item.id, { amount })}
                    isGhost
                  />
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack marginTop="$4" gap="$2">
          <Separator />
          <XStack justifyContent="space-between" paddingVertical="$2">
            <Text color="$secondaryText">Items included</Text>
            <Text color="$color" fontWeight="600">
              {diffItems.filter((i) => i.include).length} of {diffItems.length}
            </Text>
          </XStack>
          <GlassButton
            onPress={handleReplicate}
            disabled={replicatePlan.isPending}
            backgroundColor="$accentColor"
            testID="replicate-button"
          >
            <Text color="white" fontWeight="600">
              {replicatePlan.isPending ? "Creating..." : `Create ${targetName || "Plan"}`}
            </Text>
          </GlassButton>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

// ============================================================================
// DiffItemRow Component
// ============================================================================

interface DiffItemRowProps {
  item: DiffItem;
  onToggle: () => void;
  onUpdateAmount: (amount: number) => void;
  isGhost?: boolean;
}

function DiffItemRow({ item, onToggle, onUpdateAmount, isGhost }: DiffItemRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState((item.amount / 100).toString());

  const handleSave = () => {
    const newAmount = Math.round(parseFloat(editValue || "0") * 100);
    onUpdateAmount(newAmount);
    setIsEditing(false);
  };

  // Variance indicator
  const showVariance = item.variance !== undefined && Math.abs(item.variance) > 5;
  const varianceColor = item.variance && item.variance > 0 ? "$red10" : "$green10";
  const VarianceIcon = item.variance && item.variance > 0 ? TrendingUp : TrendingDown;

  return (
    <GlassyCard>
      <XStack padding="$3" alignItems="center" gap="$3">
        {/* Checkbox */}
        <Pressable onPress={onToggle} testID={`toggle-${item.id}`}>
          <YStack
            width={22}
            height={22}
            borderRadius={4}
            borderWidth={2}
            borderColor={item.include ? "$accentColor" : "$borderColor"}
            backgroundColor={item.include ? "$accentColor" : "transparent"}
            alignItems="center"
            justifyContent="center"
          >
            {item.include && <Check size={14} color="white" />}
          </YStack>
        </Pressable>

        {/* Info */}
        <YStack flex={1} opacity={item.include ? 1 : 0.5}>
          <XStack alignItems="center" gap="$2">
            <Text color="$color" fontWeight="600" fontSize={14}>
              {item.name}
            </Text>
            {isGhost && (
              <YStack backgroundColor={"#e9d5ff" as any} paddingHorizontal="$1" borderRadius="$1">
                <Text color={"#7c3aed" as any} fontSize={9} fontWeight="600">
                  NEW
                </Text>
              </YStack>
            )}
          </XStack>
          <XStack alignItems="center" gap="$2">
            <YStack
              backgroundColor={getItemTypeColor(item.type) as any}
              paddingHorizontal="$1.5"
              paddingVertical={1}
              borderRadius="$1"
            >
              <Text color="white" fontSize={9} fontWeight="700">
                {getItemTypeLabel(item.type).slice(0, 3).toUpperCase()}
              </Text>
            </YStack>
            {showVariance && (
              <XStack alignItems="center" gap="$1">
                <VarianceIcon size={10} color={varianceColor as any} />
                <Text color={varianceColor as any} fontSize={10}>
                  {Math.abs(item.variance!).toFixed(0)}%
                </Text>
              </XStack>
            )}
          </XStack>
        </YStack>

        {/* Amount */}
        <XStack alignItems="center" gap="$1">
          {isEditing ? (
            <XStack alignItems="center" gap="$1">
              <Text color="$secondaryText">€</Text>
              <Input
                width={70}
                size="$2"
                textAlign="right"
                keyboardType="decimal-pad"
                value={editValue}
                onChangeText={setEditValue}
                onBlur={handleSave}
                onSubmitEditing={handleSave}
                autoFocus
                testID={`amount-input-${item.id}`}
              />
            </XStack>
          ) : (
            <Pressable onPress={() => setIsEditing(true)} testID={`amount-${item.id}`}>
              <Text
                color={item.include ? "$color" : "$secondaryText"}
                fontWeight="600"
                fontSize={14}
              >
                {formatMoney(item.amount)}
              </Text>
            </Pressable>
          )}
        </XStack>
      </XStack>
    </GlassyCard>
  );
}
