import { Plus } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Progress, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";

// Mock data - replace with real API data
const mockGoals = [
  {
    id: "1",
    name: "Trip to Japan",
    emoji: "🇯🇵",
    current: 2400,
    target: 5000,
    status: "On track",
  },
  {
    id: "2",
    name: "Emergency Fund",
    emoji: "💰",
    current: 8000,
    target: 10000,
    status: "On track",
  },
  {
    id: "3",
    name: "New Macbook",
    emoji: "💻",
    current: 1200,
    target: 2500,
    status: "On track",
  },
];

const mockPockets = [
  { id: "1", name: "Emergency", amount: 8000, emoji: "💚" },
  { id: "2", name: "Taxes", amount: 2400, emoji: "📦" },
];

const mockBudgets = [
  { id: "1", name: "Dining Out", spent: 180, limit: 300, emoji: "🍽️" },
  { id: "2", name: "Entertainment", spent: 45, limit: 100, emoji: "🎬" },
  { id: "3", name: "Shopping", spent: 280, limit: 400, emoji: "🛍️" },
];

const mockRecurring = [
  { id: "1", name: "Netflix", amount: 15.99, nextDate: "Jan 15", emoji: "📺" },
  { id: "2", name: "Spotify", amount: 9.99, nextDate: "Jan 18", emoji: "🎵" },
  { id: "3", name: "Gym", amount: 49.99, nextDate: "Jan 1", emoji: "💪" },
];

type TabType = "goals" | "budgets" | "recurring";

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>("goals");

  const renderGoals = () => (
    <YStack gap="$4">
      <Text color="$color" fontSize={18} fontWeight="bold">
        Active Goals
      </Text>
      {mockGoals.map((goal) => {
        const progress = (goal.current / goal.target) * 100;
        return (
          <GlassyCard key={goal.id}>
            <YStack padding="$4" gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <XStack alignItems="center" gap="$2">
                  <Text fontSize={20}>{goal.emoji}</Text>
                  <Text color="$color" fontWeight="600">
                    {goal.name}
                  </Text>
                </XStack>
                <Text color="$secondaryText">{Math.round(progress)}%</Text>
              </XStack>
              <Progress value={progress} backgroundColor="$backgroundHover">
                <Progress.Indicator backgroundColor="$accentColor" />
              </Progress>
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$secondaryText" fontSize={14}>
                  ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                </Text>
                <Text color="#22c55e" fontSize={14} fontWeight="600">
                  {goal.status}
                </Text>
              </XStack>
            </YStack>
          </GlassyCard>
        );
      })}

      {/* Pockets Section */}
      <Text color="$color" fontSize={18} fontWeight="bold" marginTop="$4">
        Pockets
      </Text>
      <XStack flexWrap="wrap" gap="$3">
        {mockPockets.map((pocket) => (
          <GlassyCard key={pocket.id} width="47%">
            <YStack padding="$4" alignItems="center" gap="$2">
              <Text fontSize={32}>{pocket.emoji}</Text>
              <Text color="$secondaryText" fontSize={14}>
                {pocket.name}
              </Text>
              <Text color="$color" fontSize={20} fontWeight="bold">
                ${pocket.amount.toLocaleString()}
              </Text>
            </YStack>
          </GlassyCard>
        ))}
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
            New Pocket
          </Text>
        </YStack>
      </XStack>
    </YStack>
  );

  const renderBudgets = () => (
    <YStack gap="$4">
      <Text color="$color" fontSize={18} fontWeight="bold">
        Monthly Budgets
      </Text>
      {mockBudgets.map((budget) => {
        const progress = (budget.spent / budget.limit) * 100;
        const isOverBudget = progress > 100;
        return (
          <GlassyCard key={budget.id}>
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
                <Progress.Indicator backgroundColor={isOverBudget ? "#ef4444" : "$accentColor"} />
              </Progress>
              <XStack justifyContent="space-between" alignItems="center">
                <Text color="$secondaryText" fontSize={14}>
                  ${budget.spent} / ${budget.limit}
                </Text>
                <Text color="$secondaryText" fontSize={14}>
                  ${budget.limit - budget.spent} left
                </Text>
              </XStack>
            </YStack>
          </GlassyCard>
        );
      })}
    </YStack>
  );

  const renderRecurring = () => (
    <YStack gap="$4">
      <Text color="$color" fontSize={18} fontWeight="bold">
        Recurring Subscriptions
      </Text>
      {mockRecurring.map((sub) => (
        <GlassyCard key={sub.id}>
          <XStack padding="$4" alignItems="center" gap="$3">
            <YStack
              backgroundColor="$backgroundHover"
              width={48}
              height={48}
              borderRadius={24}
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize={24}>{sub.emoji}</Text>
            </YStack>
            <YStack flex={1}>
              <Text color="$color" fontWeight="600">
                {sub.name}
              </Text>
              <Text color="$secondaryText" fontSize={14}>
                Next: {sub.nextDate}
              </Text>
            </YStack>
            <Text color="$color" fontWeight="bold">
              ${sub.amount}
            </Text>
          </XStack>
        </GlassyCard>
      ))}
    </YStack>
  );

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
          />
        </XStack>

        {/* Segment Control */}
        <XStack backgroundColor="$backgroundHover" borderRadius="$4" padding="$1" marginBottom="$6">
          {(["goals", "budgets", "recurring"] as TabType[]).map((tab) => (
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
        {activeTab === "goals" && renderGoals()}
        {activeTab === "budgets" && renderBudgets()}
        {activeTab === "recurring" && renderRecurring()}
      </ScrollView>
    </YStack>
  );
}
