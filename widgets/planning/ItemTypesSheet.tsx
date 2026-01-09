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
// Item Config Row
// ============================================================================

function ItemConfigRow({ config }: { config: ItemConfig }) {
  const icon = ICON_MAP[config.icon] || <Wallet size={18} color="white" />;

  return (
    <XStack
      backgroundColor="rgba(255,255,255,0.05)"
      padding="$3"
      borderRadius="$3"
      alignItems="center"
      gap="$3"
    >
      {/* Icon */}
      <YStack
        width={36}
        height={36}
        borderRadius={18}
        backgroundColor={config.colorHex as any}
        alignItems="center"
        justifyContent="center"
      >
        {icon}
      </YStack>

      {/* Info */}
      <YStack flex={1}>
        <XStack alignItems="center" gap="$2">
          <Text color="$color" fontWeight="600">
            {config.label}
          </Text>
          <YStack
            backgroundColor={config.colorHex as any}
            paddingHorizontal="$1"
            paddingVertical={2}
            borderRadius="$1"
          >
            <Text color="white" fontSize={10} fontWeight="600">
              {config.shortCode}
            </Text>
          </YStack>
        </XStack>
        <Text color="$secondaryText" fontSize={12}>
          {getBehaviorLabel(config.behavior)} • {getTargetTabLabel(config.targetTab)}
        </Text>
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
