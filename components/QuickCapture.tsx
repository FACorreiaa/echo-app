/**
 * QuickCapture - Natural language transaction entry component
 *
 * Allows users to type "Coffee 1$" and have it parsed, categorized, and saved.
 */

import { Check, X } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React, { useCallback, useState } from "react";
import { Keyboard } from "react-native";
import { Button, Input, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";
import { useQuickCapture } from "@/lib/hooks/use-quick-capture";

// Simple client-side amount parser for preview
function parseAmountPreview(text: string): { amount: number; description: string } {
  const amountPattern = /(?:(\$|€|EUR|USD)\s*)?(\d+(?:[.,]\d{1,2})?)\s*(\$|€|EUR|USD)?/;
  const match = text.match(amountPattern);

  if (!match) {
    return { amount: 0, description: text.trim() };
  }

  const amountStr = match[2].replace(",", ".");
  const amount = parseFloat(amountStr) || 0;

  // Remove amount from description
  const description = text.replace(amountPattern, "").trim();

  return {
    amount,
    description: description.charAt(0).toUpperCase() + description.slice(1),
  };
}

// Format currency for display
const formatCurrency = (amount: number, code = "EUR") =>
  new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

interface QuickCaptureProps {
  onSuccess?: () => void;
  onClose?: () => void;
}

export function QuickCapture({ onSuccess, onClose }: QuickCaptureProps) {
  const [text, setText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { mutate, isPending, error } = useQuickCapture();

  // Live preview of parsed values
  const preview = parseAmountPreview(text);
  const hasAmount = preview.amount > 0;

  const handleSubmit = useCallback(() => {
    if (!text.trim()) return;

    Keyboard.dismiss();
    mutate(text, {
      onSuccess: (_) => {
        setShowSuccess(true);
        setText("");

        // Show success briefly then callback
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess?.();
        }, 1500);
      },
    });
  }, [text, mutate, onSuccess]);

  if (showSuccess) {
    return (
      <GlassyCard>
        <MotiView
          from={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
        >
          <YStack padding="$4" alignItems="center" gap="$2">
            <YStack
              backgroundColor="rgba(34, 197, 94, 0.2)"
              width={48}
              height={48}
              borderRadius={24}
              alignItems="center"
              justifyContent="center"
            >
              <Check size={24} color="#22c55e" />
            </YStack>
            <Text color="#22c55e" fontSize={16} fontWeight="600">
              Transaction Added!
            </Text>
          </YStack>
        </MotiView>
      </GlassyCard>
    );
  }

  return (
    <GlassyCard>
      <YStack padding="$4" gap="$3">
        {/* Header */}
        <XStack justifyContent="space-between" alignItems="center">
          <Text color="$color" fontSize={16} fontWeight="600">
            Quick Capture
          </Text>
          {onClose && (
            <Button size="$2" circular chromeless onPress={onClose}>
              <X size={18} color="$secondaryText" />
            </Button>
          )}
        </XStack>

        {/* Input */}
        <Input
          placeholder='Try "Coffee 1$" or "Dinner €25"'
          value={text}
          onChangeText={setText}
          autoFocus
          autoCapitalize="sentences"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          backgroundColor="$backgroundHover"
          borderWidth={0}
          size="$4"
        />

        {/* Live Preview */}
        {text.length > 0 && (
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 200 }}
          >
            <YStack backgroundColor="$backgroundHover" padding="$3" borderRadius="$3" gap="$1">
              <XStack justifyContent="space-between">
                <Text color="$secondaryText" fontSize={12}>
                  Description
                </Text>
                <Text color="$color" fontSize={14} fontWeight="500">
                  {preview.description || "..."}
                </Text>
              </XStack>
              <XStack justifyContent="space-between">
                <Text color="$secondaryText" fontSize={12}>
                  Amount
                </Text>
                <Text
                  color={hasAmount ? "#22c55e" : "$secondaryText"}
                  fontSize={14}
                  fontWeight="600"
                >
                  {hasAmount ? formatCurrency(preview.amount) : "No amount detected"}
                </Text>
              </XStack>
            </YStack>
          </MotiView>
        )}

        {/* Error */}
        {error && (
          <Text color="#ef4444" fontSize={12}>
            {error.message}
          </Text>
        )}

        {/* Submit Button */}
        <Button
          backgroundColor={hasAmount ? "$accentColor" : "$backgroundHover"}
          color={hasAmount ? "white" : "$secondaryText"}
          disabled={!hasAmount || isPending}
          onPress={handleSubmit}
          opacity={isPending ? 0.7 : 1}
        >
          {isPending ? "Saving..." : "Add Transaction"}
        </Button>
      </YStack>
    </GlassyCard>
  );
}
