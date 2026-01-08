import { Plus } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { GradientBackground } from "@/components/animations/GradientBackground";
import { GlassyCard } from "@/components/ui/GlassyCard";
import { useGoals, type Goal } from "@/lib/hooks/use-goals";
import { ContributeSheet, CreateGoalSheet, EditGoalSheet, GoalCard } from "@/widgets/goals";

const PageTitle = styled(Text, {
  color: "$color",
  fontSize: 28,
  fontFamily: "$heading",
});

export default function GoalsScreen() {
  // Fetch active goals from API
  const { data: goals, isLoading, isError } = useGoals("active");

  // Sheet state
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [editSheetOpen, setEditSheetOpen] = useState(false);
  const [contributeSheetOpen, setContributeSheetOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleGoalPress = (goal: Goal) => {
    setSelectedGoal(goal);
    setEditSheetOpen(true);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <YStack paddingHorizontal={20} paddingTop={20} gap={20}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
              <PageTitle>Goals</PageTitle>
            </XStack>

            {/* Loading State */}
            {isLoading && (
              <GlassyCard>
                <YStack padding="$4" alignItems="center">
                  <Text color="$secondaryText">Loading your goals...</Text>
                </YStack>
              </GlassyCard>
            )}

            {/* Error State */}
            {isError && (
              <GlassyCard>
                <YStack padding="$4" alignItems="center" gap="$2">
                  <Text color="$color" fontWeight="600">
                    Unable to load goals
                  </Text>
                  <Text color="$secondaryText" fontSize={14}>
                    Check your connection and try again
                  </Text>
                </YStack>
              </GlassyCard>
            )}

            {/* Empty State */}
            {!isLoading && !isError && (!goals || goals.length === 0) && (
              <GlassyCard>
                <YStack padding="$4" alignItems="center" gap="$2">
                  <Text color="$color" fontSize={18} fontWeight="600">
                    No active goals
                  </Text>
                  <Text color="$secondaryText" fontSize={14} textAlign="center">
                    Tap the + button to create your first goal
                  </Text>
                </YStack>
              </GlassyCard>
            )}

            {/* Goals Grid */}
            {!isLoading && !isError && goals && goals.length > 0 && (
              <YStack gap={16}>
                {goals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} onPress={() => handleGoalPress(goal)} />
                ))}
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* FAB - Create Goal */}
        <Pressable
          onPress={() => setCreateSheetOpen(true)}
          style={{
            position: "absolute",
            bottom: 100,
            right: 20,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: "#2da6fa",
            alignItems: "center",
            justifyContent: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Plus size={28} color="white" />
        </Pressable>

        {/* Create Goal Sheet */}
        <CreateGoalSheet open={createSheetOpen} onOpenChange={setCreateSheetOpen} />

        {/* Edit Goal Sheet */}
        <EditGoalSheet open={editSheetOpen} onOpenChange={setEditSheetOpen} goal={selectedGoal} />

        {/* Contribute to Goal Sheet */}
        <ContributeSheet
          open={contributeSheetOpen}
          onOpenChange={setContributeSheetOpen}
          goal={selectedGoal}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}
