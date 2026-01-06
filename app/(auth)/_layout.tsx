import { GradientBackground, ThemeToggle } from "@/components";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { XStack } from "tamagui";

export default function AuthLayout() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        {/* Auth Header with Back Button and Theme Toggle */}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          paddingHorizontal={20}
          paddingVertical={10}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={24} color={isDark ? "white" : "black"} />
          </TouchableOpacity>
          <ThemeToggle />
        </XStack>

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "transparent" },
          }}
        >
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
        </Stack>
      </SafeAreaView>
    </GradientBackground>
  );
}
