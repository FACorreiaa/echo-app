import { Calendar, DollarSign, Search, SlidersHorizontal } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Input, Spinner, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";

// TODO: Replace with actual API hook when backend endpoint exists
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category?: string;
}

// Placeholder data - will be replaced with actual API call
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    date: "2024-12-27",
    description: "COMPRA PIZZARIA URBAN",
    amount: -17.0,
    category: "COMPRAS",
  },
  {
    id: "2",
    date: "2024-12-26",
    description: "CAR WAL CRT DEB REVOL",
    amount: -100.0,
    category: "LEVANTAMENTOS",
  },
  {
    id: "3",
    date: "2024-12-26",
    description: "COMPRAS C.DEB MIGU S",
    amount: -36.0,
    category: "COMPRAS",
  },
  { id: "4", date: "2024-12-24", description: "U16602470", amount: 1000.0, category: "Diversos" },
  {
    id: "5",
    date: "2024-12-20",
    description: "Netflix Subscription",
    amount: -12.99,
    category: "Entertainment",
  },
];

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, _setIsLoading] = useState(false);

  // TODO: Replace with actual useQuery hook for transactions
  const transactions = MOCK_TRANSACTIONS;

  const filteredTransactions = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? "+" : "";
    return `${sign}€${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <GlassyCard marginBottom="$3">
      <XStack justifyContent="space-between" alignItems="center">
        <YStack flex={1} gap="$1">
          <Text fontWeight="600" numberOfLines={1} color="$color">
            {item.description}
          </Text>
          <XStack gap="$2" alignItems="center">
            <Calendar size={12} color="$secondaryText" />
            <Text fontSize={12} color="$secondaryText">
              {formatDate(item.date)}
            </Text>
            {item.category && (
              <>
                <Text color="$secondaryText">•</Text>
                <Text fontSize={12} color="$secondaryText">
                  {item.category}
                </Text>
              </>
            )}
          </XStack>
        </YStack>
        <Text fontWeight="700" fontSize={16} color={item.amount >= 0 ? "$green10" : "$red10"}>
          {formatAmount(item.amount)}
        </Text>
      </XStack>
    </GlassyCard>
  );

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      {/* Header */}
      <YStack padding="$4" gap="$4">
        <XStack alignItems="center" gap="$3">
          <Button
            size="$3"
            circular
            icon={DollarSign}
            backgroundColor="$accentColor"
            color="white"
            unstyled
          />
          <YStack flex={1}>
            <H2 color="$color" fontSize={24}>
              Transactions
            </H2>
            <Text color="$secondaryText">{filteredTransactions.length} transactions</Text>
          </YStack>
          <Button
            size="$3"
            circular
            icon={SlidersHorizontal}
            backgroundColor="$cardBackground"
            onPress={() => {
              // TODO: Open filters modal
            }}
          />
        </XStack>

        {/* Search */}
        <XStack
          backgroundColor="$cardBackground"
          borderRadius="$4"
          paddingHorizontal="$3"
          alignItems="center"
          gap="$2"
        >
          <Search size={18} color="$secondaryText" />
          <Input
            flex={1}
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            backgroundColor="transparent"
            borderWidth={0}
            placeholderTextColor="$secondaryText"
          />
        </XStack>
      </YStack>

      {/* Transactions List */}
      {isLoading ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$accentColor" />
        </YStack>
      ) : filteredTransactions.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <Text color="$secondaryText" textAlign="center">
            {searchQuery ? "No transactions match your search" : "No transactions yet"}
          </Text>
          <Button
            marginTop="$4"
            backgroundColor="$accentColor"
            color="white"
            onPress={() => router.push("/(tabs)/import")}
          >
            Import Transactions
          </Button>
        </YStack>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </YStack>
  );
}
