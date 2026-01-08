import { Filter, Plus } from "@tamagui/lucide-icons";
import { ActivityIndicator, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { GradientBackground } from "@/components/animations/GradientBackground";
import { ListItem } from "@/components/ListItem";
import { Avatar } from "@/components/ui/Avatar";
import { GlassyCard } from "@/components/ui/GlassyCard";
import { useSpendingPulse } from "@/lib/hooks/use-insights";
import { useFlatTransactions } from "@/lib/hooks/use-transactions";

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

// Transaction interface for UI
interface UITransaction {
  id: string;
  merchantName: string;
  description: string;
  categoryName: string | null;
  amount: number;
  postedAt: Date | null;
}

export default function SpendScreen() {
  // Fetch transactions using flat query
  const { transactions: rawTransactions, isLoading: transactionsLoading } = useFlatTransactions();

  // Convert proto transactions to UI format
  const transactions: UITransaction[] = (rawTransactions ?? []).map((tx) => ({
    id: tx.id,
    merchantName: tx.merchantName ?? "",
    description: tx.description ?? "",
    categoryName: null, // Not in proto yet
    amount: tx.amount ? Number(tx.amount.amountMinor) / 100 : 0,
    postedAt: tx.postedAt ? new Date(Number(tx.postedAt.seconds) * 1000) : null,
  }));

  // Fetch spending pulse for category breakdown
  const { data: pulse, isLoading: pulseLoading } = useSpendingPulse();
  const topCategories = pulse?.topCategories ?? [];

  // Format date for grouping
  function formatDateGroup(date: Date | null): string {
    if (!date) return "Unknown";
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (txDate.getTime() === today.getTime()) return "Today";
    if (txDate.getTime() === yesterday.getTime()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
  }

  // Group transactions by date
  const groupedTransactions = transactions.reduce<Record<string, UITransaction[]>>((acc, tx) => {
    const dateStr = formatDateGroup(tx.postedAt);
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(tx);
    return acc;
  }, {});

  // Format amount for display
  function formatAmount(amount: number): string {
    const prefix = amount < 0 ? "-" : "+";
    return `${prefix}€${Math.abs(amount).toFixed(2)}`;
  }

  // Get current month name
  const currentMonth = new Date().toLocaleDateString("en-US", { month: "long" });

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
                    {currentMonth}
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
              {pulseLoading ? (
                <YStack alignItems="center" padding="$4">
                  <ActivityIndicator color="#2da6fa" />
                </YStack>
              ) : topCategories.length === 0 ? (
                <Text color="$secondaryText" textAlign="center" padding="$4">
                  No spending data yet
                </Text>
              ) : (
                <YStack gap={12}>
                  {topCategories.slice(0, 5).map((cat) => (
                    <XStack key={cat.categoryName} alignItems="center" gap={12}>
                      <YStack
                        width={4}
                        height={32}
                        borderRadius={2}
                        backgroundColor="$accentGradientStart"
                      />
                      <CategoryLabel>{cat.categoryName}</CategoryLabel>
                      <CategoryAmount>€{cat.amount.toFixed(2)}</CategoryAmount>
                    </XStack>
                  ))}
                </YStack>
              )}
            </GlassyCard>

            {/* Transaction List */}
            <YStack gap={8}>
              <SectionTitle>All Transactions</SectionTitle>
              {transactionsLoading ? (
                <YStack alignItems="center" padding="$6">
                  <ActivityIndicator color="#2da6fa" />
                  <Text color="$secondaryText" marginTop="$2">
                    Loading transactions...
                  </Text>
                </YStack>
              ) : transactions.length === 0 ? (
                <GlassyCard>
                  <YStack padding="$5" alignItems="center" gap="$3">
                    <Text fontSize={32}>💸</Text>
                    <Text color="$color" fontWeight="600">
                      No Transactions
                    </Text>
                    <Text color="$secondaryText" textAlign="center" fontSize={14}>
                      Import a CSV or add your first transaction
                    </Text>
                  </YStack>
                </GlassyCard>
              ) : (
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
                          title={tx.merchantName || tx.description || "Unknown"}
                          subtitle={tx.categoryName ?? "Uncategorized"}
                          left={
                            <Avatar name={tx.merchantName || tx.description || "?"} size="md" />
                          }
                          right={
                            <Text
                              color={tx.amount < 0 ? "$color" : "#22c55e"}
                              fontSize={16}
                              fontFamily="$body"
                            >
                              {formatAmount(tx.amount)}
                            </Text>
                          }
                          onPress={() => {}}
                        />
                      ))}
                    </YStack>
                  ))}
                </YStack>
              )}
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
