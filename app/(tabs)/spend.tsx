import { Filter, Plus } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/ui/Avatar";
import { GradientBackground } from "@/components/animations/GradientBackground";
import { ListItem } from "@/components/ListItem";
import { GlassyCard } from "@/components/ui/GlassyCard";

const PageTitle = styled(Text, {
  color: "$color",
  fontSize: 28,
  fontFamily: "$heading",
});

const PeriodPill = styled(XStack, {
  backgroundColor: "$listItemBackground",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 16,
  alignItems: "center",
  pressStyle: {
    opacity: 0.8,
  },
});

const CategoryLabel = styled(Text, {
  color: "$color",
  fontSize: 14,
  fontFamily: "$body",
  flex: 1,
});

const CategoryAmount = styled(Text, {
  color: "$color",
  fontSize: 14,
  fontFamily: "$heading",
});

const SectionTitle = styled(Text, {
  color: "$color",
  fontSize: 18,
  fontFamily: "$heading",
  marginBottom: 12,
});

const DateHeader = styled(Text, {
  color: "$secondaryText",
  fontSize: 13,
  fontFamily: "$body",
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 8,
});

// Mock data
const categories = [
  { name: "Food & Drinks", amount: "€234.50", percent: 35 },
  { name: "Transport", amount: "€89.00", percent: 13 },
  { name: "Subscriptions", amount: "€67.99", percent: 10 },
  { name: "Shopping", amount: "€156.00", percent: 23 },
  { name: "Other", amount: "€120.00", percent: 18 },
];

const transactions = [
  {
    id: "1",
    name: "Starbucks",
    category: "Food & Drinks",
    amount: "-€5.40",
    date: "Today",
    group: "Today",
  },
  {
    id: "2",
    name: "Uber",
    category: "Transport",
    amount: "-€12.50",
    date: "10:30",
    group: "Today",
  },
  {
    id: "3",
    name: "Amazon",
    category: "Shopping",
    amount: "-€29.99",
    date: "Yesterday",
    group: "Yesterday",
  },
  {
    id: "4",
    name: "Netflix",
    category: "Subscriptions",
    amount: "-€12.99",
    date: "Dec 25",
    group: "December 25",
  },
  {
    id: "5",
    name: "Lidl",
    category: "Food & Drinks",
    amount: "-€45.23",
    date: "Dec 25",
    group: "December 25",
  },
];

const groupedTransactions = transactions.reduce(
  (acc, tx) => {
    if (!acc[tx.group]) acc[tx.group] = [];
    acc[tx.group].push(tx);
    return acc;
  },
  {} as Record<string, typeof transactions>,
);

export default function SpendScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <YStack paddingHorizontal={20} paddingTop={20} gap={20}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
              <PageTitle>Spend</PageTitle>
              <XStack gap={12}>
                <PeriodPill>
                  <Text color="$color" fontSize={14} fontFamily="$body">
                    December
                  </Text>
                </PeriodPill>
                <Pressable>
                  <Filter size={24} color="$secondaryText" />
                </Pressable>
              </XStack>
            </XStack>

            {/* Category Breakdown */}
            <GlassyCard>
              <SectionTitle>By Category</SectionTitle>
              <YStack gap={12}>
                {categories.map((cat) => (
                  <XStack key={cat.name} alignItems="center" gap={12}>
                    <YStack
                      width={4}
                      height={32}
                      borderRadius={2}
                      backgroundColor="$accentGradientStart"
                    />
                    <CategoryLabel>{cat.name}</CategoryLabel>
                    <CategoryAmount>{cat.amount}</CategoryAmount>
                  </XStack>
                ))}
              </YStack>
            </GlassyCard>

            {/* Transaction List */}
            <YStack gap={8}>
              <SectionTitle>All Transactions</SectionTitle>
              <YStack
                backgroundColor="$cardBackground"
                borderRadius={16}
                borderWidth={1}
                borderColor="$borderColor"
                overflow="hidden"
              >
                {Object.entries(groupedTransactions).map(([group, txs]) => (
                  <YStack key={group}>
                    <DateHeader>{group}</DateHeader>
                    {txs.map((tx) => (
                      <ListItem
                        key={tx.id}
                        title={tx.name}
                        subtitle={tx.category}
                        left={<Avatar name={tx.name} size="md" />}
                        right={
                          <Text color="$color" fontSize={16} fontFamily="$body">
                            {tx.amount}
                          </Text>
                        }
                        onPress={() => {}}
                      />
                    ))}
                  </YStack>
                ))}
              </YStack>
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
