import { ClipboardList, FileSpreadsheet, Home, Lightbulb, Sparkles } from "@tamagui/lucide-icons";
import { Redirect, Tabs } from "expo-router";
import React from "react";
import { useTheme } from "tamagui";

import { HapticTab } from "@/components/haptic-tab";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function TabLayout() {
  const theme = useTheme();
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

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.accentGradientStart?.val || "#2da6fa",
        tabBarInactiveTintColor: theme.secondaryText?.val || "#9ca3af",
        tabBarStyle: {
          backgroundColor: theme.background?.val || "#0b0f19",
          borderTopColor: theme.borderColor?.val || "rgba(255,255,255,0.15)",
          borderTopWidth: 1,
          paddingTop: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontFamily: "$body",
          fontSize: 11,
          marginTop: 4,
        },
        headerShown: false,
        tabBarButton: HapticTab,
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
  );
}
