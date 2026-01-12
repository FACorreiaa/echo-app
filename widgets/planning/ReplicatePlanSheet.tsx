import { GlassButton, GlassInput } from "@/components/GlassComponents";
import { GlassyCard } from "@/components/ui/GlassyCard";
import { usePlan, useReplicatePlan } from "@/lib/hooks/use-plans";
import { AlertTriangle, ArrowRight, Lock, X } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import { Input, ScrollView, Sheet, Switch, Text, XStack, YStack } from "tamagui";

interface ReplicatePlanSheetProps {
  sourcePlanId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DiffItem {
  id: string; // Source Item ID
  name: string;
  amount: number; // Minor units
  type: "budget" | "recurring" | "goal" | "income";
  status: "locked" | "review" | "new";
  originalAmount: number;
}

export function ReplicatePlanSheet({ sourcePlanId, open, onOpenChange }: ReplicatePlanSheetProps) {
  const { data: sourcePlan } = usePlan(sourcePlanId);
  const replicatePlan = useReplicatePlan();

  const [date, setDate] = useState(new Date()); // Default to Today (or Next Month logic)
  const [targetName, setTargetName] = useState("");

  // Smart Logic State
  const [applySurplus, setApplySurplus] = useState(false);
  const [diffItems, setDiffItems] = useState<DiffItem[]>([]);

  // Initialize defaults when source plan loads
  useEffect(() => {
    if (sourcePlan && open) {
      // Default to next month
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setDate(nextMonth);

      const monthName = nextMonth.toLocaleString("default", { month: "long", year: "numeric" });
      setTargetName(`${monthName} Plan`);

      // Generate Diff
      const items: DiffItem[] = [];
      sourcePlan.categoryGroups.forEach((g) => {
        g.categories.forEach((c) => {
          c.items.forEach((i) => {
            let status: DiffItem["status"] = "review";
            if (i.itemType === "recurring") status = "locked";
            if (i.itemType === "income") status = "locked"; // Salary usually fixed

            items.push({
              id: i.id,
              name: i.name,
              amount: i.budgeted * 100, // Convert to minor
              type: (i.itemType as any) || "budget",
              status,
              originalAmount: i.budgeted * 100,
            });
          });
        });
      });
      setDiffItems(items);
    }
  }, [sourcePlan, open]);

  const handleReplicate = async () => {
    try {
      if (!targetName.trim()) {
        Alert.alert("Error", "Please enter a plan name.");
        return;
      }

      await replicatePlan.mutateAsync({
        sourcePlanId,
        targetDate: date,
        newName: targetName,
        // In real impl, we'd pass diffItems overrides here
      });

      onOpenChange(false);
      Alert.alert("Success", `Replicated plan from ${sourcePlan?.name}`);
    } catch (error) {
      console.error("Replication failed:", error);
      Alert.alert("Error", "Failed to replicate plan.");
    }
  };

  const handleUpdateItem = (id: string, newAmount: number) => {
    setDiffItems((prev) => prev.map((i) => (i.id === id ? { ...i, amount: newAmount } : i)));
  };

  if (!sourcePlan) return null;

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[90]} dismissOnSnapToBottom>
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
          <Text color="$color" fontSize={24} fontWeight="bold">
            Replicate Plan
          </Text>
          <Pressable onPress={() => onOpenChange(false)}>
            <X size={24} color="$secondaryText" />
          </Pressable>
        </XStack>

        <ScrollView showsVerticalScrollIndicator={false}>
          <YStack gap="$6">
            {/* Target Settings */}
            <GlassyCard>
              <YStack padding="$4" gap="$4">
                <YStack gap="$2">
                  <Text
                    color="$secondaryText"
                    fontSize={12}
                    fontWeight="600"
                    textTransform="uppercase"
                  >
                    Target Period
                  </Text>
                  <Text color="$color" fontSize={20} fontWeight="600">
                    {date.toLocaleString("default", { month: "long", year: "numeric" })}
                  </Text>
                  {/* Date Picker would go here */}
                </YStack>

                <YStack gap="$2">
                  <Text
                    color="$secondaryText"
                    fontSize={12}
                    fontWeight="600"
                    textTransform="uppercase"
                  >
                    New Plan Name
                  </Text>
                  <GlassInput
                    value={targetName}
                    onChangeText={setTargetName}
                    placeholder="e.g. March 2026"
                  />
                </YStack>
              </YStack>
            </GlassyCard>

            {/* Smart Diff Section */}
            <YStack gap="$3">
              <Text color="$color" fontSize={18} fontWeight="600">
                Smart Review
              </Text>

              {/* Rollover Card */}
              {sourcePlan.surplus > 0 && (
                <GlassyCard>
                  <XStack padding="$3" alignItems="center" justifyContent="space-between">
                    <XStack gap="$3" alignItems="center" flex={1}>
                      <YStack backgroundColor="$green3" padding="$2" borderRadius="$3">
                        <ArrowRight size={16} color="$green11" />
                      </YStack>
                      <YStack>
                        <Text color="$color" fontWeight="600">
                          Rollover Surplus
                        </Text>
                        <Text color="$secondaryText" fontSize={12}>
                          You have €{sourcePlan.surplus} left from {sourcePlan.name}. Add to
                          Savings?
                        </Text>
                      </YStack>
                    </XStack>
                    <Switch size="$3" checked={applySurplus} onCheckedChange={setApplySurplus}>
                      <Switch.Thumb animation="bouncy" />
                    </Switch>
                  </XStack>
                </GlassyCard>
              )}

              {/* Items List */}
              <YStack gap="$2">
                {diffItems.map((item) => (
                  <GlassyCard key={item.id}>
                    <XStack padding="$3" alignItems="center" gap="$3">
                      {/* Status Icon */}
                      {item.status === "locked" ? (
                        <Lock size={16} color="$secondaryText" />
                      ) : (
                        <AlertTriangle size={16} color="$orange8" />
                      )}

                      <YStack flex={1}>
                        <Text color="$color" fontWeight="600">
                          {item.name}
                        </Text>
                        <XStack gap="$2" alignItems="center">
                          <Text
                            fontSize={12}
                            textTransform="capitalize"
                            color={item.status === "locked" ? "$secondaryText" : "$orange8"}
                          >
                            {item.status === "locked" ? "Inherited" : "Verify Amount"}
                          </Text>
                        </XStack>
                      </YStack>

                      {/* Amount Input */}
                      <XStack alignItems="center" gap="$2">
                        <Text color="$secondaryText">€</Text>
                        <Input
                          width={80}
                          textAlign="right"
                          keyboardType="numeric"
                          value={(item.amount / 100).toString()}
                          onChangeText={(t) =>
                            handleUpdateItem(item.id, parseFloat(t || "0") * 100)
                          }
                          backgroundColor={
                            item.status === "review" ? "rgba(245, 158, 11, 0.1)" : "transparent"
                          }
                          borderColor={item.status === "review" ? "$orange8" : "transparent"}
                        />
                      </XStack>
                    </XStack>
                  </GlassyCard>
                ))}
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>

        {/* Footer */}
        <YStack marginTop="$4">
          <GlassButton
            onPress={handleReplicate}
            disabled={replicatePlan.isPending}
            backgroundColor="$accentColor"
          >
            <Text color="white" fontWeight="600">
              {replicatePlan.isPending ? "Creating Plan..." : "Create Plan"}
            </Text>
          </GlassButton>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
