/**
 * Onboarding Screen
 * Shown to new users after registration to set up their starting balance
 */

import { router } from "expo-router";

import { OnboardingFlow } from "@/widgets/onboarding";

export default function OnboardingScreen() {
  const handleComplete = () => {
    // Navigate to main app
    router.replace("/(tabs)");
  };

  return <OnboardingFlow onComplete={handleComplete} />;
}
