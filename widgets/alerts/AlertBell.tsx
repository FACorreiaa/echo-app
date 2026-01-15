/**
 * AlertBell - Bell icon with unread badge, opens alerts sheet
 */

import { Bell } from "@tamagui/lucide-icons";
import React, { useState } from "react";
import {
  Button,
  ScrollView,
  Separator,
  Sheet,
  Spinner,
  Stack,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { Alert, useAlerts, useDismissAlert, useMarkAlertRead } from "@/lib/hooks/use-insights";

interface AlertBellProps {
  size?: number;
}

const getSeverityEmoji = (severity: string) => {
  switch (severity) {
    case "critical":
      return "🚨";
    case "warning":
      return "⚠️";
    case "info":
    default:
      return "💡";
  }
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return "Just now";
};

export function AlertBell({ size = 24 }: AlertBellProps) {
  const [open, setOpen] = useState(false);
  const { data: alerts = [], isLoading, refetch } = useAlerts(true, 20);
  const markRead = useMarkAlertRead();
  const dismiss = useDismissAlert();

  const unreadCount = alerts.length;

  const handleAlertPress = (alert: Alert) => {
    if (!alert.isRead) {
      markRead.mutate(alert.id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleDismiss = (alertId: string) => {
    dismiss.mutate(alertId, {
      onSuccess: () => refetch(),
    });
  };

  return (
    <>
      <Button size="$4" circular chromeless onPress={() => setOpen(true)} position="relative">
        <Bell size={size} />
        {unreadCount > 0 && (
          <Stack
            position="absolute"
            top={-2}
            right={-2}
            width={18}
            height={18}
            borderRadius={9}
            backgroundColor={"#ef4444" as any}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={10} fontWeight="bold" color={"white" as any}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </Stack>
        )}
      </Button>

      <Sheet modal open={open} onOpenChange={setOpen} snapPoints={[80]} dismissOnSnapToBottom>
        <Sheet.Overlay />
        <Sheet.Handle />
        <Sheet.Frame padding="$4" backgroundColor="$background">
          <YStack gap="$3" flex={1}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$6" fontWeight="bold">
                Notifications
              </Text>
              <Text fontSize="$3" color="$secondaryText">
                {unreadCount} unread
              </Text>
            </XStack>

            <Separator />

            {/* Alerts List */}
            <ScrollView flex={1} showsVerticalScrollIndicator={false}>
              {isLoading ? (
                <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
                  <Spinner size="large" />
                </YStack>
              ) : alerts.length === 0 ? (
                <YStack flex={1} alignItems="center" justifyContent="center" padding="$6">
                  <Text fontSize={40}>✨</Text>
                  <Text fontSize="$5" color="$secondaryText" marginTop="$2">
                    All caught up!
                  </Text>
                  <Text fontSize="$3" color="$secondaryText" textAlign="center" marginTop="$1">
                    No new alerts right now
                  </Text>
                </YStack>
              ) : (
                <YStack gap="$3">
                  {alerts.map((alert) => (
                    <AlertCard
                      key={alert.id}
                      alert={alert}
                      onPress={() => handleAlertPress(alert)}
                      onDismiss={() => handleDismiss(alert.id)}
                      getSeverityEmoji={getSeverityEmoji}
                      formatRelativeTime={formatRelativeTime}
                    />
                  ))}
                </YStack>
              )}
            </ScrollView>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}

interface AlertCardProps {
  alert: Alert;
  onPress: () => void;
  onDismiss: () => void;
  getSeverityEmoji: (severity: string) => string;
  formatRelativeTime: (date: Date) => string;
}

const getSeverityBorderColor = (severity: string): string => {
  switch (severity) {
    case "critical":
      return "#ef4444";
    case "warning":
      return "#f97316";
    case "info":
    default:
      return "#3b82f6";
  }
};

function AlertCard({
  alert,
  onPress,
  onDismiss,
  getSeverityEmoji,
  formatRelativeTime,
}: AlertCardProps) {
  return (
    <YStack
      backgroundColor="$backgroundHover"
      borderRadius="$4"
      padding="$3"
      borderLeftWidth={4}
      borderLeftColor={getSeverityBorderColor(alert.severity) as any}
      opacity={alert.isRead ? 0.7 : 1}
      pressStyle={{ scale: 0.98, opacity: 0.9 }}
      onPress={onPress}
    >
      <XStack justifyContent="space-between" alignItems="flex-start">
        <XStack gap="$2" alignItems="center" flex={1}>
          <Text fontSize={20}>{getSeverityEmoji(alert.severity)}</Text>
          <YStack flex={1}>
            <Text fontSize="$4" fontWeight={alert.isRead ? "normal" : "bold"} numberOfLines={1}>
              {alert.title}
            </Text>
            <Text fontSize="$3" color="$secondaryText" numberOfLines={2} marginTop="$1">
              {alert.message}
            </Text>
          </YStack>
        </XStack>

        <Button
          size="$2"
          chromeless
          circular
          onPress={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
        >
          <Text fontSize="$3" color="$secondaryText">
            ✕
          </Text>
        </Button>
      </XStack>

      <XStack justifyContent="space-between" marginTop="$2">
        <Text fontSize="$2" color="$secondaryText">
          {formatRelativeTime(alert.createdAt)}
        </Text>
        {!alert.isRead && (
          <Stack width={8} height={8} borderRadius={4} backgroundColor={"#3b82f6" as any} />
        )}
      </XStack>
    </YStack>
  );
}

export default AlertBell;
