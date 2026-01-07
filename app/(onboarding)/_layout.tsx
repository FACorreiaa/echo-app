import { Redirect, Stack } from "expo-router";

import { useAuthStore } from "@/lib/stores/auth-store";

export default function OnboardingLayout() {
  const { isAuthenticated, isHydrated, hasCompletedOnboarding } = useAuthStore();

  // Wait for hydration before making auth decision
  if (!isHydrated) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  // If already completed onboarding, go to main app
  if (hasCompletedOnboarding) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
      }}
    />
  );
}
