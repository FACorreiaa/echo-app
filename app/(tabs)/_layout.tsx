import { ClipboardList, FileSpreadsheet, Home, Lightbulb, Sparkles } from "@tamagui/lucide-icons";
import { Redirect, Tabs, useRouter, useSegments } from "expo-router";
import React from "react";
import { useTheme, YStack } from "tamagui";

import { CommandBar } from "@/components";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function TabLayout() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isHydrated, hasCompletedOnboarding } = useAuthStore();

  // Wait for hydration before making auth decision
  if (!isHydrated) {
    return null; // Or a loading spinner
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // Redirect to onboarding if not completed
  if (!hasCompletedOnboarding) {
    return <Redirect href="/(onboarding)" />;
  }

  // Determine active tab from segments
  const activeTab = segments[segments.length - 1] as string;

  const handleNavigate = (tab: string) => {
    router.push(`/(tabs)/${tab === "index" ? "" : tab}`);
  };

  return (
    <YStack flex={1}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: theme.hudActive?.val || "#2da6fa",
          tabBarInactiveTintColor: "#636366",
          tabBarStyle: {
            display: "none", // Hide default tab bar
          },
          headerShown: false,
        }}
      >
        {/* Main 5 tabs */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => <Home size={24} color={color as any} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: "Insights",
            tabBarIcon: ({ color }) => <Lightbulb size={24} color={color as any} />,
          }}
        />
        <Tabs.Screen
          name="wrapped"
          options={{
            title: "Wrapped",
            tabBarIcon: ({ color }) => <Sparkles size={24} color={color as any} />,
          }}
        />
        <Tabs.Screen
          name="planning"
          options={{
            title: "Planning",
            tabBarIcon: ({ color }) => <ClipboardList size={24} color={color as any} />,
          }}
        />
        <Tabs.Screen
          name="import"
          options={{
            title: "Import",
            tabBarIcon: ({ color }) => <FileSpreadsheet size={24} color={color as any} />,
          }}
        />

        {/* Hidden tabs - accessible via navigation but not in tab bar */}
        <Tabs.Screen
          name="transactions"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="spend"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="goals"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="subscriptions"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Floating Holographic Navigation Bar */}
      <CommandBar activeTab={activeTab} onNavigate={handleNavigate} />
    </YStack>
  );
}
