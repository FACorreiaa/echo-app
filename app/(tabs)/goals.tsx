import { Plus, TrendingDown, TrendingUp } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { GradientBackground } from "@/components/animations/GradientBackground";
import { GlassyCard } from "@/components/ui/GlassyCard";

const PageTitle = styled(Text, {
  color: "$color",
  fontSize: 28,
  fontFamily: "$heading",
});

const GoalTitle = styled(Text, {
  color: "$color",
  fontSize: 18,
  fontFamily: "$heading",
});

const GoalSubtitle = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
});

const ProgressLabel = styled(Text, {
  color: "$color",
  fontSize: 24,
  fontFamily: "$heading",
});

const TargetLabel = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
});

const PacingBadge = styled(XStack, {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
  alignItems: "center",
  gap: 4,
  variants: {
    status: {
      ahead: { backgroundColor: "rgba(34, 197, 94, 0.2)" },
      behind: { backgroundColor: "rgba(239, 68, 68, 0.2)" },
      onTrack: { backgroundColor: "rgba(45, 166, 250, 0.2)" },
    },
  } as const,
});

// Mock goals
const goals = [
  {
    id: "1",
    name: "Emergency Fund",
    current: 3500,
    target: 10000,
    deadline: "Dec 2025",
    status: "ahead" as const,
    pacingText: "2 months ahead",
  },
  {
    id: "2",
    name: "New MacBook",
    current: 800,
    target: 2500,
    deadline: "Jun 2025",
    status: "behind" as const,
    pacingText: "1 month behind",
  },
  {
    id: "3",
    name: "Vacation Fund",
    current: 1200,
    target: 3000,
    deadline: "Aug 2025",
    status: "onTrack" as const,
    pacingText: "On track",
  },
];

const statusColors = {
  ahead: "#22c55e",
  behind: "#ef4444",
  onTrack: "#2da6fa",
};

export default function GoalsScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <YStack paddingHorizontal={20} paddingTop={20} gap={20}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
              <PageTitle>Goals</PageTitle>
            </XStack>

            {/* Goals Grid */}
            <YStack gap={16}>
              {goals.map((goal) => {
                const progress = (goal.current / goal.target) * 100;
                return (
                  <GlassyCard key={goal.id}>
                    <YStack gap={16}>
                      <XStack justifyContent="space-between" alignItems="flex-start">
                        <YStack gap={4} flex={1}>
                          <GoalTitle>{goal.name}</GoalTitle>
                          <GoalSubtitle>Target: {goal.deadline}</GoalSubtitle>
                        </YStack>
                        <PacingBadge status={goal.status}>
                          {goal.status === "ahead" && (
                            <TrendingUp size={14} color={statusColors.ahead as any} />
                          )}
                          {goal.status === "behind" && (
                            <TrendingDown size={14} color={statusColors.behind as any} />
                          )}
                          <Text
                            color={statusColors[goal.status] as any}
                            fontSize={12}
                            fontFamily="$body"
                          >
                            {goal.pacingText}
                          </Text>
                        </PacingBadge>
                      </XStack>

                      <YStack gap={8}>
                        <XStack justifyContent="space-between" alignItems="baseline">
                          <ProgressLabel>€{goal.current.toLocaleString()}</ProgressLabel>
                          <TargetLabel>of €{goal.target.toLocaleString()}</TargetLabel>
                        </XStack>
                        <YStack
                          height={8}
                          backgroundColor="$listItemBackground"
                          borderRadius={4}
                          overflow="hidden"
                        >
                          <YStack
                            height="100%"
                            width={`${Math.min(progress, 100)}%`}
                            backgroundColor={statusColors[goal.status] as any}
                            borderRadius={4}
                          />
                        </YStack>
                      </YStack>
                    </YStack>
                  </GlassyCard>
                );
              })}
            </YStack>
          </YStack>
        </ScrollView>

        {/* FAB */}
        <Pressable
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
      </SafeAreaView>
    </GradientBackground>
  );
}
