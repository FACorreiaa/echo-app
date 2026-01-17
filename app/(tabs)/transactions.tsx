import {
  Bookmark,
  Calendar,
  Check,
  DollarSign,
  Search,
  SlidersHorizontal,
  Trash2,
} from "@tamagui/lucide-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { Alert, Pressable } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button, H2, Input, Spinner, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components";
import { RememberThisModal } from "@/components/RememberThisModal";
import { useDeleteImportBatch, useFlatTransactions } from "@/lib/hooks/use-transactions";

const formatAmount = (amountMinor: bigint, currencyCode: string) => {
  const amount = Number(amountMinor) / 100;
  const sign = amount >= 0 ? "+" : "";
  const symbol = currencyCode === "EUR" ? "€" : currencyCode === "USD" ? "$" : currencyCode;
  return `${sign}${symbol}${Math.abs(amount).toFixed(2)}`;
};

const formatDate = (timestamp: { seconds: bigint } | undefined) => {
  if (!timestamp) return "";
  const date = new Date(Number(timestamp.seconds) * 1000);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export default function TransactionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  // Get import job ID from query params (staging view)
  const { importJobId } = useLocalSearchParams<{ importJobId?: string }>();
  const isStaging = !!importJobId;

  // Modal state for "Remember This"
  const [selectedTransaction, setSelectedTransaction] = useState<{
    id: string;
    description: string;
    merchantName?: string;
    categoryId?: string;
  } | null>(null);

  // Delete mutation for staging view
  const deleteMutation = useDeleteImportBatch();

  // Use real API data with infinite query, filtered by import if staging
  const { transactions, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage, error } =
    useFlatTransactions(isStaging ? { importJobId } : undefined);

  // Filter transactions by search query (client-side for now)
  const filteredTransactions = useMemo(() => {
    if (!searchQuery.trim()) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(query) || t.categoryId?.toLowerCase().includes(query),
    );
  }, [transactions, searchQuery]);

  const handleDeleteBatch = () => {
    if (!importJobId) return;

    Alert.alert(
      "Delete Import",
      `Are you sure you want to delete all ${transactions.length} transactions from this import?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync(importJobId);
              router.replace("/(tabs)/transactions");
            } catch {
              Alert.alert("Error", "Failed to delete import batch");
            }
          },
        },
      ],
    );
  };

  const handleKeep = () => {
    // Simply navigate to main transactions view (data is already in DB)
    router.replace("/(tabs)/transactions");
  };

  const renderTransaction = useCallback(
    ({
      item,
    }: {
      item: {
        id: string;
        description: string;
        amount?: { amountMinor: bigint; currencyCode: string };
        categoryId?: string;
        postedAt?: { seconds: bigint };
      };
    }) => {
      const amount = item.amount ? Number(item.amount.amountMinor) / 100 : 0;

      return (
        <Pressable
          onLongPress={() =>
            setSelectedTransaction({
              id: item.id,
              description: item.description,
              categoryId: item.categoryId,
            })
          }
          delayLongPress={300}
        >
          <GlassyCard marginBottom="$3">
            <XStack justifyContent="space-between" alignItems="center">
              <YStack flex={1} gap="$1">
                <Text fontWeight="600" numberOfLines={1} color="$color">
                  {item.description}
                </Text>
                <XStack gap="$2" alignItems="center">
                  <Calendar size={12} color="$secondaryText" />
                  <Text fontSize={12} color="$secondaryText">
                    {formatDate(item.postedAt)}
                  </Text>
                  {item.categoryId && (
                    <>
                      <Text color="$secondaryText">•</Text>
                      <Text fontSize={12} color="$secondaryText">
                        {item.categoryId}
                      </Text>
                    </>
                  )}
                </XStack>
              </YStack>
              <XStack alignItems="center" gap="$2">
                <Button
                  size="$2"
                  circular
                  chromeless
                  icon={<Bookmark size={16} />}
                  onPress={() =>
                    setSelectedTransaction({
                      id: item.id,
                      description: item.description,
                      categoryId: item.categoryId,
                    })
                  }
                />
                <Text fontWeight="700" fontSize={16} color={amount >= 0 ? "$green10" : "$red10"}>
                  {item.amount
                    ? formatAmount(item.amount.amountMinor, item.amount.currencyCode)
                    : "€0.00"}
                </Text>
              </XStack>
            </XStack>
          </GlassyCard>
        </Pressable>
      );
    },
    [setSelectedTransaction],
  );

  const keyExtractor = useCallback((item: { id: string }) => item.id, []);

  const handleEndReached = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <YStack flex={1} backgroundColor="$background" paddingTop={insets.top}>
      {/* Staging Toolbar */}
      {isStaging && (
        <XStack
          backgroundColor="$blue4"
          paddingHorizontal="$4"
          paddingVertical="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <YStack>
            <Text fontWeight="600" color="$blue11">
              Import Preview
            </Text>
            <Text fontSize={12} color="$blue10">
              {transactions.length} transactions imported
            </Text>
          </YStack>
          <XStack gap="$2">
            <Button
              size="$3"
              icon={Trash2}
              backgroundColor="$red10"
              color="white"
              onPress={handleDeleteBatch}
              disabled={deleteMutation.isPending}
            >
              Delete
            </Button>
            <Button
              size="$3"
              icon={Check}
              backgroundColor="$green10"
              color="white"
              onPress={handleKeep}
            >
              Keep
            </Button>
          </XStack>
        </XStack>
      )}

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
              {isStaging ? "Imported Transactions" : "Transactions"}
            </H2>
            <Text color="$secondaryText">{filteredTransactions.length} transactions</Text>
          </YStack>
          {!isStaging && (
            <Button
              size="$3"
              circular
              icon={SlidersHorizontal}
              backgroundColor="$cardBackground"
              onPress={() => {
                // TODO: Open filters modal
              }}
            />
          )}
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
            onChangeText={setSearchQuery as unknown as (e: unknown) => void}
            backgroundColor="transparent"
            borderWidth={0}
            placeholderTextColor="$secondaryText"
          />
        </XStack>
      </YStack>

      {/* Transactions List */}
      {isLoading && transactions.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$accentColor" />
        </YStack>
      ) : error ? (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <Text color="$red10" textAlign="center">
            Failed to load transactions
          </Text>
        </YStack>
      ) : filteredTransactions.length === 0 ? (
        <YStack flex={1} justifyContent="center" alignItems="center" padding="$6">
          <Text color="$secondaryText" textAlign="center">
            {searchQuery ? "No transactions match your search" : "No transactions yet"}
          </Text>
          {!isStaging && (
            <Button
              marginTop="$4"
              backgroundColor="$accentColor"
              color="white"
              onPress={() => router.push("/(tabs)/import")}
            >
              Import Transactions
            </Button>
          )}
        </YStack>
      ) : (
        <FlashList
          data={filteredTransactions}
          renderItem={renderTransaction}
          // @ts-ignore - estimatedItemSize is valid but types may be outdated
          estimatedItemSize={80}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <YStack alignItems="center" padding="$4">
                <Spinner size="small" color="$accentColor" />
              </YStack>
            ) : null
          }
        />
      )}

      {/* Remember This Modal */}
      {selectedTransaction && (
        <RememberThisModal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          transaction={selectedTransaction}
          onSuccess={() => setSelectedTransaction(null)}
        />
      )}
    </YStack>
  );
}
