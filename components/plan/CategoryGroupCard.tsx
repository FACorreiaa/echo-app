/**
 * CategoryGroupCard - Displays a category group with its categories and items
 */

import { ChevronDown, ChevronUp } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Pressable, TextInput } from "react-native";
import { Slider, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/GlassyCard";
import type { PlanCategoryGroup, PlanItem } from "@/lib/hooks/use-plans";
import { formatMoney, getLabel } from "@/lib/hooks/use-plans";

interface CategoryGroupCardProps {
  group: PlanCategoryGroup;
  currencyCode: string;
  lang?: string;
  onItemChange?: (itemId: string, value: number) => void;
  readonly?: boolean;
}

export function CategoryGroupCard({
  group,
  currencyCode,
  lang = "pt",
  onItemChange,
  readonly = false,
}: CategoryGroupCardProps) {
  const [expanded, setExpanded] = useState(true);

  const totalBudgeted = group.categories.reduce(
    (sum, cat) => sum + cat.items.reduce((catSum, item) => catSum + item.budgeted, 0),
    0,
  );

  return (
    <GlassyCard>
      <YStack>
        {/* Group Header */}
        <Pressable onPress={() => setExpanded(!expanded)}>
          <XStack
            padding="$4"
            justifyContent="space-between"
            alignItems="center"
            backgroundColor={(group.color ?? "$backgroundHover") as any}
            borderTopLeftRadius="$4"
            borderTopRightRadius="$4"
          >
            <YStack>
              <Text color="white" fontWeight="bold" fontSize={16}>
                {getLabel(group.labels, lang) || group.name}
              </Text>
              <Text color="white" opacity={0.8} fontSize={12}>
                {group.targetPercent}% target • {group.categories.length} categories
              </Text>
            </YStack>
            <XStack alignItems="center" gap="$2">
              <Text color="white" fontWeight="600">
                {formatMoney(totalBudgeted, currencyCode)}
              </Text>
              {expanded ? (
                <ChevronUp size={18} color="white" />
              ) : (
                <ChevronDown size={18} color="white" />
              )}
            </XStack>
          </XStack>
        </Pressable>

        {/* Categories and Items */}
        {expanded && (
          <YStack padding="$3" gap="$3">
            {group.categories.map((category) => (
              <YStack key={category.id} gap="$2">
                <XStack alignItems="center" gap="$2">
                  {category.icon && <Text fontSize={16}>{category.icon}</Text>}
                  <Text color="$color" fontWeight="600" flex={1}>
                    {getLabel(category.labels, lang) || category.name}
                  </Text>
                </XStack>

                {category.items.map((item) => (
                  <PlanItemRow
                    key={item.id}
                    item={item}
                    currencyCode={currencyCode}
                    lang={lang}
                    onChange={readonly ? undefined : (value) => onItemChange?.(item.id, value)}
                  />
                ))}
              </YStack>
            ))}
          </YStack>
        )}
      </YStack>
    </GlassyCard>
  );
}

// ============================================================================
// Item Row Component
// ============================================================================

interface PlanItemRowProps {
  item: PlanItem;
  currencyCode: string;
  lang?: string;
  onChange?: (value: number) => void;
}

function PlanItemRow({ item, currencyCode, lang = "pt", onChange }: PlanItemRowProps) {
  const [value, setValue] = useState(item.budgeted);
  const label = getLabel(item.labels, lang) || item.name;

  const handleChange = (newValue: number) => {
    setValue(newValue);
    onChange?.(newValue);
  };

  // Render based on widget type
  switch (item.widgetType) {
    case "slider":
      return (
        <YStack gap="$1" paddingLeft="$4">
          <XStack justifyContent="space-between">
            <Text color="$secondaryText" fontSize={14}>
              {label}
            </Text>
            <Text color="$color" fontSize={14}>
              {item.fieldType === "percentage"
                ? `${value.toFixed(0)}%`
                : formatMoney(value, currencyCode)}
            </Text>
          </XStack>
          <Slider
            value={[value]}
            onValueChange={([v]) => handleChange(v)}
            max={item.fieldType === "percentage" ? 100 : value * 2 || 1000}
            step={item.fieldType === "percentage" ? 1 : 10}
            disabled={!onChange}
          >
            <Slider.Track backgroundColor="$backgroundHover">
              <Slider.TrackActive backgroundColor="$accentColor" />
            </Slider.Track>
            <Slider.Thumb index={0} size="$1" circular backgroundColor="$accentColor" />
          </Slider>
        </YStack>
      );

    case "readonly":
      return (
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingLeft="$4"
          paddingVertical="$1"
        >
          <Text color="$secondaryText" fontSize={14}>
            {label}
          </Text>
          <Text color="$color" fontWeight="500">
            {formatMoney(item.budgeted, currencyCode)}
          </Text>
        </XStack>
      );

    case "input":
    default:
      return (
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingLeft="$4"
          paddingVertical="$1"
        >
          <Text color="$secondaryText" fontSize={14} flex={1}>
            {label}
          </Text>
          {onChange ? (
            <XStack
              backgroundColor="$backgroundHover"
              borderRadius="$2"
              paddingHorizontal="$2"
              paddingVertical="$1"
              minWidth={100}
            >
              <TextInput
                value={value.toFixed(2)}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  handleChange(num);
                }}
                keyboardType="numeric"
                style={{
                  color: "white",
                  textAlign: "right",
                  minWidth: 80,
                }}
              />
              <Text color="$secondaryText" marginLeft="$1">
                €
              </Text>
            </XStack>
          ) : (
            <Text color="$color" fontWeight="500">
              {formatMoney(item.budgeted, currencyCode)}
            </Text>
          )}
        </XStack>
      );
  }
}
