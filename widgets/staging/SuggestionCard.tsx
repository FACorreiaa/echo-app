/**
 * SuggestionCard - Displays detected items from Excel import for user confirmation
 *
 * Features:
 * - Pulse animation for new suggestions
 * - Accept → opens pre-filled edit sheet
 * - Dismiss → removes suggestion
 * - Shows cell reference and detected value
 */

import { Check, X } from "@tamagui/lucide-icons";
import { MotiView } from "moti";
import React from "react";
import { Button, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";

// ============================================================================
// Types
// ============================================================================

export interface ImportSuggestion {
  id: string;
  type: "goal" | "budget" | "recurring";
  suggestedName: string;
  cellRef: string;
  suggestedAmount?: number;
  confidence: number; // 0-1
}

export interface SuggestionCardProps {
  suggestion: ImportSuggestion;
  onAccept: (suggestion: ImportSuggestion) => void;
  onDismiss: (suggestion: ImportSuggestion) => void;
}

// ============================================================================
// Helpers
// ============================================================================

function getTypeLabel(type: ImportSuggestion["type"]): string {
  const labels = {
    goal: "Goal",
    budget: "Budget Category",
    recurring: "Subscription",
  };
  return labels[type];
}

function getTypeEmoji(type: ImportSuggestion["type"]): string {
  const emojis = {
    goal: "🎯",
    budget: "💰",
    recurring: "🔄",
  };
  return emojis[type];
}

// ============================================================================
// Component
// ============================================================================

export function SuggestionCard({ suggestion, onAccept, onDismiss }: SuggestionCardProps) {
  const { type, suggestedName, cellRef, suggestedAmount, confidence } = suggestion;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95, translateY: 10 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 400 }}
    >
      <GlassyCard>
        {/* Pulse indicator for new items */}
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 1000,
            loop: true,
          }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#22c55e",
          }}
        />

        <YStack padding="$4" gap="$3">
          {/* Header */}
          <XStack alignItems="center" gap="$2">
            <Text fontSize={24}>{getTypeEmoji(type)}</Text>
            <YStack flex={1}>
              <Text color="$color" fontWeight="600" fontSize={16}>
                Found: "{suggestedName}"
              </Text>
              <Text color="$secondaryText" fontSize={12}>
                Cell {cellRef} • {getTypeLabel(type)}
              </Text>
            </YStack>
          </XStack>

          {/* Amount if available */}
          {suggestedAmount !== undefined && (
            <Text color="$blue10" fontSize={20} fontWeight="bold">
              €{suggestedAmount.toLocaleString()}
            </Text>
          )}

          {/* Confidence indicator */}
          <XStack alignItems="center" gap="$2">
            <YStack
              flex={1}
              height={4}
              backgroundColor="$backgroundHover"
              borderRadius={2}
              overflow="hidden"
            >
              <YStack
                height="100%"
                width={`${confidence * 100}%`}
                backgroundColor={
                  confidence > 0.7 ? "#22c55e" : confidence > 0.4 ? "#f59e0b" : "#ef4444"
                }
              />
            </YStack>
            <Text color="$secondaryText" fontSize={10}>
              {Math.round(confidence * 100)}% match
            </Text>
          </XStack>

          {/* Actions */}
          <XStack gap="$3" marginTop="$2">
            <Button
              flex={1}
              size="$4"
              backgroundColor="$green4"
              color="$green10"
              icon={Check}
              onPress={() => onAccept(suggestion)}
            >
              Add as {getTypeLabel(type)}
            </Button>
            <Button
              size="$4"
              backgroundColor="$backgroundHover"
              color="$secondaryText"
              icon={X}
              onPress={() => onDismiss(suggestion)}
            />
          </XStack>
        </YStack>
      </GlassyCard>
    </MotiView>
  );
}
