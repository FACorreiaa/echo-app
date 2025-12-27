import { ArrowDownUp, Home, Lightbulb, Settings, Target } from "@tamagui/lucide-icons";
import { Tabs } from "expo-router";
import React from "react";
import { useTheme } from "tamagui";

import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
  const theme = useTheme();

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
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home size={24} color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="spend"
        options={{
          title: "Spend",
          tabBarIcon: ({ color }) => <ArrowDownUp size={24} color={color as any} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: "Goals",
          tabBarIcon: ({ color }) => <Target size={24} color={color as any} />,
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
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => <Settings size={24} color={color as any} />,
        }}
      />
    </Tabs>
  );
}
