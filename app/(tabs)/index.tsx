import {
  ArrowLeftRight,
  ChevronRight,
  CreditCard,
  MoreHorizontal,
  Plus,
} from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { Avatar } from "@/components/Avatar";
import { GradientBackground } from "@/components/GradientBackground";
import { ListItem } from "@/components/ListItem";
import { PromoCard } from "@/components/PromoCard";
import { QuickActionButton } from "@/components/QuickActionButton";

const BalanceLabel = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
  textAlign: "center",
});

const BalanceAmount = styled(Text, {
  color: "$color",
  fontSize: 48,
  fontFamily: "$heading",
  textAlign: "center",
  marginVertical: 8,
});

const AccountPill = styled(XStack, {
  backgroundColor: "$listItemBackground",
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  alignSelf: "center",
  alignItems: "center",
  gap: 6,
  pressStyle: {
    opacity: 0.8,
  },
});

const SectionTitle = styled(Text, {
  color: "$color",
  fontSize: 18,
  fontFamily: "$heading",
  marginBottom: 12,
});

const SeeAllText = styled(Text, {
  color: "$accentGradientStart",
  fontSize: 14,
  fontFamily: "$body",
});

// Mock data
const recentTransactions = [
  { id: "1", name: "Netflix", description: "Subscription", amount: "-€12.99", date: "Today" },
  { id: "2", name: "Spotify", description: "Subscription", amount: "-€9.99", date: "Yesterday" },
  {
    id: "3",
    name: "Grocery Store",
    description: "Food & Drinks",
    amount: "-€45.23",
    date: "Dec 25",
  },
];

export default function DashboardScreen() {
  const router = useRouter();

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <YStack paddingHorizontal={20} paddingTop={40} gap={24}>
            {/* Balance Section */}
            <YStack alignItems="center" gap={8}>
              <BalanceLabel>Personal · EUR</BalanceLabel>
              <BalanceAmount>€7,293.40</BalanceAmount>
              <AccountPill>
                <Text color="$color" fontSize={14} fontFamily="$body">
                  Accounts
                </Text>
                <ChevronRight size={16} color="$secondaryText" />
              </AccountPill>
            </YStack>

            {/* Quick Actions */}
            <XStack justifyContent="center" gap={16} marginTop={20}>
              <QuickActionButton
                icon={<Plus size={24} color="$color" />}
                label="Import"
                onPress={() => router.push("/(tabs)/import")}
              />
              <QuickActionButton
                icon={<ArrowLeftRight size={24} color="$color" />}
                label="Move"
                onPress={() => {}}
              />
              <QuickActionButton
                icon={<CreditCard size={24} color="$color" />}
                label="Details"
                onPress={() => {}}
              />
              <QuickActionButton
                icon={<MoreHorizontal size={24} color="$color" />}
                label="More"
                onPress={() => {}}
              />
            </XStack>

            {/* Promo Card */}
            <PromoCard
              title="Your Wrapped is Ready!"
              subtitle="See your December spending story"
              gradient
              onPress={() => router.push("/(tabs)/insights")}
            />

            {/* Recent Transactions */}
            <YStack gap={8}>
              <XStack justifyContent="space-between" alignItems="center">
                <SectionTitle>Recent Transactions</SectionTitle>
                <SeeAllText onPress={() => router.push("/(tabs)/spend")}>See All</SeeAllText>
              </XStack>

              <YStack
                backgroundColor="$cardBackground"
                borderRadius={16}
                borderWidth={1}
                borderColor="$borderColor"
                overflow="hidden"
              >
                {recentTransactions.map((tx) => (
                  <ListItem
                    key={tx.id}
                    title={tx.name}
                    subtitle={tx.description}
                    left={<Avatar name={tx.name} size="md" />}
                    right={
                      <YStack alignItems="flex-end">
                        <Text color="$color" fontSize={16} fontFamily="$body">
                          {tx.amount}
                        </Text>
                        <Text color="$secondaryText" fontSize={12}>
                          {tx.date}
                        </Text>
                      </YStack>
                    }
                    onPress={() => {}}
                  />
                ))}
              </YStack>
            </YStack>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
