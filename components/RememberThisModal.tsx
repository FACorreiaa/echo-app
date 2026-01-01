/**
 * RememberThisModal - Modal for creating categorization rules from transactions
 *
 * Usage:
 * <RememberThisModal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   transaction={{ description: "COMPRAS STARBUCKS" }}
 * />
 */

import { Check, Tag, X } from "@tamagui/lucide-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView } from "react-native";
import { Button, Dialog, Input, Label, Switch, Text, XStack, YStack } from "tamagui";

import { useCategories } from "@/lib/hooks/use-categories";
import { useCreateCategoryRule } from "@/lib/hooks/use-insights";

interface Transaction {
  id?: string;
  description: string;
  merchantName?: string;
  categoryId?: string;
}

interface RememberThisModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
  onSuccess?: () => void;
}

// Clean up raw bank descriptions
const cleanDescription = (desc: string): string => {
  // Remove common prefixes
  let clean = desc
    .replace(/^(COMPRAS?|PAGAMENTO|TRANSFERENCIA|PIX|TED|DOC)\s*/i, "")
    .replace(/\s*\d{2,}$/, "") // Remove trailing numbers
    .trim();

  // Title case
  clean = clean
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return clean;
};

export function RememberThisModal({
  isOpen,
  onClose,
  transaction,
  onSuccess,
}: RememberThisModalProps) {
  // Form state
  const [cleanName, setCleanName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>();
  const [applyToExisting, setApplyToExisting] = useState(true);
  const [isRecurring, setIsRecurring] = useState(false);

  // Hooks
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const createRule = useCreateCategoryRule();

  // Initialize form when transaction changes
  useEffect(() => {
    if (transaction) {
      // Use merchantName if available, otherwise clean up description
      const initialName = transaction.merchantName || cleanDescription(transaction.description);
      setCleanName(initialName);
      setSelectedCategoryId(transaction.categoryId);
    }
  }, [transaction]);

  const handleSubmit = async () => {
    if (!cleanName.trim()) return;

    try {
      await createRule.mutateAsync({
        matchPattern: transaction.description,
        cleanName: cleanName.trim(),
        categoryId: selectedCategoryId,
        isRecurring,
        applyToExisting,
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Failed to create rule:", error);
    }
  };

  return (
    <Dialog modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          opacity={0.5}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animateOnly={["transform", "opacity"]}
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          width={340}
          padding="$4"
          borderRadius="$6"
          backgroundColor="$background"
        >
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
            <Dialog.Title fontSize={18} fontWeight="600">
              Remember This
            </Dialog.Title>
            <Button size="$2" circular chromeless icon={<X size={18} />} onPress={onClose} />
          </XStack>

          {/* Original description */}
          <YStack gap="$1" marginBottom="$4">
            <Text fontSize={12} color="$secondaryText">
              Original Transaction
            </Text>
            <Text fontSize={13} color="$color" numberOfLines={2}>
              {transaction.description}
            </Text>
          </YStack>

          {/* Clean name input */}
          <YStack gap="$2" marginBottom="$4">
            <Label htmlFor="cleanName">Display Name</Label>
            <Input
              id="cleanName"
              value={cleanName}
              onChangeText={setCleanName as unknown as (e: unknown) => void}
              placeholder="e.g., Starbucks"
              borderRadius="$4"
            />
          </YStack>

          {/* Category selector */}
          <YStack gap="$2" marginBottom="$4">
            <Label>Category</Label>
            {categoriesLoading ? (
              <ActivityIndicator />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {categories?.map((cat) => (
                  <Button
                    key={cat.id}
                    size="$3"
                    borderRadius="$4"
                    backgroundColor={
                      selectedCategoryId === cat.id ? "$accentColor" : "$backgroundHover"
                    }
                    pressStyle={{ opacity: 0.8 }}
                    onPress={() => setSelectedCategoryId(cat.id)}
                    icon={
                      selectedCategoryId === cat.id ? (
                        <Check size={14} color="white" />
                      ) : (
                        <Tag size={14} />
                      )
                    }
                  >
                    <Text fontSize={13} color={selectedCategoryId === cat.id ? "white" : "$color"}>
                      {cat.name}
                    </Text>
                  </Button>
                ))}
              </ScrollView>
            )}
          </YStack>

          {/* Toggles */}
          <YStack gap="$3" marginBottom="$4">
            <XStack justifyContent="space-between" alignItems="center">
              <Label flex={1}>Apply to existing transactions</Label>
              <Switch size="$3" checked={applyToExisting} onCheckedChange={setApplyToExisting}>
                <Switch.Thumb animation="quick" />
              </Switch>
            </XStack>

            <XStack justifyContent="space-between" alignItems="center">
              <Label flex={1}>Mark as recurring</Label>
              <Switch size="$3" checked={isRecurring} onCheckedChange={setIsRecurring}>
                <Switch.Thumb animation="quick" />
              </Switch>
            </XStack>
          </YStack>

          {/* Submit button */}
          <Button
            size="$4"
            backgroundColor="$accentColor"
            color="white"
            borderRadius="$4"
            onPress={handleSubmit}
            disabled={createRule.isPending || !cleanName.trim()}
            icon={createRule.isPending ? <ActivityIndicator color="white" /> : undefined}
          >
            {createRule.isPending ? "Saving..." : "Remember This"}
          </Button>

          {/* Result feedback */}
          {createRule.isSuccess && (
            <Text fontSize={12} color="$green10" textAlign="center" marginTop="$2">
              ✓ Rule created! {createRule.data?.transactionsUpdated} transactions updated.
            </Text>
          )}

          {createRule.isError && (
            <Text fontSize={12} color="$red10" textAlign="center" marginTop="$2">
              Failed to create rule. Please try again.
            </Text>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
