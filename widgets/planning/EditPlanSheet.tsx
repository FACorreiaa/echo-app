import { usePlan, useUpdatePlanStructure } from "@/lib/hooks/use-plans";
import { X } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { Alert, Pressable } from "react-native";
import { Button, ScrollView, Sheet, Text, XStack, YStack } from "tamagui";
import { BuilderGroup, CategoryGroupBuilder, ItemType } from "./CategoryGroupBuilder";

interface EditPlanSheetProps {
  planId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPlanSheet({ planId, open, onOpenChange }: EditPlanSheetProps) {
  const { data: plan, isLoading } = usePlan(planId);
  const updatePlan = useUpdatePlanStructure();
  const [builderGroups, setBuilderGroups] = useState<BuilderGroup[]>([]);

  // Initialize builder groups from plan data
  useEffect(() => {
    if (plan && open) {
      const groups: BuilderGroup[] = plan.categoryGroups.map((g) => ({
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
            // Only populate initialActualMinor for goals to avoid overwriting calculated actuals for budgets
            initialActualMinor: i.itemType === "goal" ? Math.round(i.actual * 100) : undefined,
          })),
        })),
      }));
      setBuilderGroups(groups);
    }
  }, [plan, open]);

  const handleSave = async () => {
    try {
      await updatePlan.mutateAsync({
        planId,
        categoryGroups: builderGroups.map((g) => ({
          id: g.id.startsWith("group_") ? undefined : g.id, // New groups have temp IDs
          name: g.name,
          color: g.color,
          targetPercent: g.targetPercent,
          categories: g.categories.map((c) => ({
            id: c.id.startsWith("cat_") ? undefined : c.id,
            name: c.name,
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
      Alert.alert("Success", "Plan updated successfully");
    } catch (error) {
      console.error("Failed to update plan:", error);
      Alert.alert("Error", "Failed to update plan");
    }
  };

  return (
    <Sheet modal open={open} onOpenChange={onOpenChange} snapPoints={[85]} dismissOnSnapToBottom>
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
            Edit Plan Structure
          </Text>
          <Pressable onPress={() => onOpenChange(false)}>
            <X size={24} color="$secondaryText" />
          </Pressable>
        </XStack>

        <Text color="$secondaryText" marginBottom="$4">
          Add or remove categories, adjust budgets, and update savings goals.
        </Text>

        {isLoading ? (
          <YStack flex={1} alignItems="center" justifyContent="center">
            <Text color="$secondaryText">Loading plan...</Text>
          </YStack>
        ) : (
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <CategoryGroupBuilder
              groups={builderGroups}
              onChange={setBuilderGroups}
              initialGroups={builderGroups.length === 0 ? undefined : builderGroups} // Optional optimization
            />
          </ScrollView>
        )}

        <XStack gap="$3" marginTop="$4">
          <Button
            flex={1}
            backgroundColor="$backgroundHover"
            color="$color"
            onPress={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            flex={2}
            backgroundColor="$accentColor"
            color="white"
            onPress={handleSave}
            disabled={updatePlan.isPending}
          >
            {updatePlan.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </XStack>
      </Sheet.Frame>
    </Sheet>
  );
}
