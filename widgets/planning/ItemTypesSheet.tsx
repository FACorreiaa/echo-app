/**
 * ItemTypesSheet - Bottom sheet for viewing/managing item type configurations
 *
 * Accessible from within the Planning tab, this sheet shows all available
 * item types and their behaviors.
 */

import {
  BarChart2,
  CreditCard,
  Repeat,
  Settings,
  Target,
  TrendingUp,
  Wallet,
  X,
} from "@tamagui/lucide-icons";
import React from "react";
import { Pressable, ScrollView } from "react-native";
import { Button, H3, Sheet, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import { ITEM_TYPE_TOOLTIPS } from "@/components/ui/Tooltip";
import {
  getBehaviorLabel,
  getTargetTabLabel,
  useItemConfigs,
  type ItemConfig,
} from "@/lib/hooks/use-item-configs";

// Icon mapping for config icons
const ICON_MAP: Record<string, React.ReactNode> = {
  wallet: <Wallet size={18} color="white" />,
  repeat: <Repeat size={18} color="white" />,
  target: <Target size={18} color="white" />,
  "trending-up": <TrendingUp size={18} color="white" />,
  "bar-chart-2": <BarChart2 size={18} color="white" />,
  "credit-card": <CreditCard size={18} color="white" />,
};

interface ItemTypesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ItemTypesSheet({ open, onOpenChange }: ItemTypesSheetProps) {
  const { data: configs = [], isLoading } = useItemConfigs();

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[85]}
      dismissOnSnapToBottom
      animation="medium"
    >
      <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
      <Sheet.Frame backgroundColor="$background" borderTopLeftRadius={20} borderTopRightRadius={20}>
        <Sheet.Handle backgroundColor="$borderColor" />

        <YStack flex={1} padding="$4" gap="$3">
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center">
            <XStack alignItems="center" gap="$2">
              <Settings size={20} color="$accentColor" />
              <H3 color="$color">Item Types</H3>
            </XStack>
            <Pressable onPress={() => onOpenChange(false)}>
              <X size={24} color="$secondaryText" />
            </Pressable>
          </XStack>

          <Text color="$secondaryText" fontSize={14}>
            These determine how items are categorized and where they appear in your dashboard.
          </Text>

          {/* Configs list */}
          {isLoading ? (
            <Text color="$secondaryText">Loading...</Text>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              <YStack gap="$2">
                {configs.map((config) => (
                  <ItemConfigRow key={config.id} config={config} />
                ))}
              </YStack>

              {/* Legend */}
              <GlassyCard marginTop="$4">
                <YStack padding="$3" gap="$2">
                  <Text color="$color" fontWeight="600" fontSize={14}>
                    Behaviors
                  </Text>
                  <XStack flexWrap="wrap" gap="$2">
                    <BehaviorBadge label="Outflow" color="#ef4444" description="Expenses" />
                    <BehaviorBadge label="Inflow" color="#22c55e" description="Income" />
                    <BehaviorBadge label="Asset" color="#8b5cf6" description="Investments" />
                    <BehaviorBadge label="Liability" color="#f59e0b" description="Debts" />
                  </XStack>
                </YStack>
              </GlassyCard>

              <Text color="$secondaryText" fontSize={12} textAlign="center" marginTop="$3">
                Custom item types coming soon
              </Text>
            </ScrollView>
          )}

          <Button onPress={() => onOpenChange(false)}>Done</Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

// ============================================================================
// Helpers
// ============================================================================

const getItemTypeKey = (targetTab: string): string => {
  switch (targetTab) {
    case "budgets":
      return "budget";
    case "recurring":
      return "recurring";
    case "goals":
      return "goal";
    case "income":
      return "income";
    case "portfolio":
      return "investment";
    case "liabilities":
      return "debt";
    default:
      return "budget";
  }
};

// ============================================================================
// Item Config Row
// ============================================================================

function ItemConfigRow({ config }: { config: ItemConfig }) {
  const icon = ICON_MAP[config.icon] || <Wallet size={18} color="white" />;

  // Get description for this item type
  const description = ITEM_TYPE_TOOLTIPS[getItemTypeKey(config.targetTab)];

  return (
    <XStack
      backgroundColor="rgba(255,255,255,0.05)"
      padding="$3"
      borderRadius="$3"
      alignItems="flex-start"
      gap="$3"
    >
      {/* Icon */}
      <YStack
        width={40}
        height={40}
        borderRadius={20}
        backgroundColor={config.colorHex as any}
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </YStack>

      {/* Info */}
      <YStack flex={1} gap="$1">
        <XStack alignItems="center" gap="$2">
          <Text color="$color" fontWeight="700" fontSize={15}>
            {config.label}
          </Text>
          <YStack
            backgroundColor={config.colorHex as any}
            paddingHorizontal="$2"
            paddingVertical={2}
            borderRadius="$2"
          >
            <Text color="white" fontSize={11} fontWeight="700">
              {config.shortCode}
            </Text>
          </YStack>
        </XStack>

        {/* Description */}
        <Text color="$secondaryText" fontSize={13} lineHeight={18}>
          {description}
        </Text>

        {/* Behavior & Tab info */}
        <XStack gap="$2" marginTop="$1">
          <Text color="$secondaryText" fontSize={11}>
            {getBehaviorLabel(config.behavior)} • {getTargetTabLabel(config.targetTab)}
          </Text>
        </XStack>
      </YStack>
    </XStack>
  );
}

// ============================================================================
// Behavior Badge
// ============================================================================

function BehaviorBadge({
  label,
  color,
  description,
}: {
  label: string;
  color: string;
  description: string;
}) {
  return (
    <XStack alignItems="center" gap="$1">
      <YStack width={8} height={8} borderRadius={4} backgroundColor={color as any} />
      <Text color="$color" fontSize={12} fontWeight="500">
        {label}
      </Text>
      <Text color="$secondaryText" fontSize={12}>
        ({description})
      </Text>
    </XStack>
  );
}
