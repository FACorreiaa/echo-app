import {
  Accessibility,
  Bell,
  ChevronRight,
  Eye,
  HelpCircle,
  Inbox,
  Info,
  LogOut,
  Palette,
  Shield,
  User,
} from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { Avatar, GlassyCard, GradientBackground, ThemeToggle } from "@/components";
import { ListItem } from "@/components/ListItem";

const UserName = styled(Text, {
  color: "$color",
  fontSize: 24,
  fontFamily: "$heading",
  textAlign: "center",
  marginTop: 12,
});

const UserHandle = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
  textAlign: "center",
});

const UpgradeBadge = styled(XStack, {
  backgroundColor: "rgba(45, 166, 250, 0.2)",
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
  alignItems: "center",
  gap: 4,
});

const menuItems = {
  main: [
    { icon: HelpCircle, label: "Help", route: null },
    { icon: User, label: "Account", route: null },
    // v0.1: Removed to focus on Import -> Map -> Plan loop
    // { icon: FileText, label: "Documents & Statements", route: null },
    // { icon: Lightbulb, label: "Learn", route: null },
    { icon: Inbox, label: "Inbox", route: null, badge: 3 },
  ],
  settings: [
    { icon: Shield, label: "Security", route: null },
    { icon: Eye, label: "Privacy", route: null },
    { icon: Bell, label: "Notification Settings", route: null },
    { icon: Palette, label: "Appearance", route: null, hasToggle: true },
    { icon: Accessibility, label: "Accessibility", route: null },
  ],
  footer: [
    { icon: Info, label: "About Echo", route: null },
    { icon: LogOut, label: "Log Out", route: "logout", isDestructive: true },
  ],
};

export default function SettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    console.log("[SETTINGS] handleLogout called");
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          console.log("[SETTINGS] User confirmed logout");
          try {
            // 1. Get refresh token BEFORE clearing state
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { getRefreshToken, clearAllAuthState } = require("@/lib/storage/token-storage");
            const refreshToken = await getRefreshToken();
            console.log("[SETTINGS] Got refresh token:", !!refreshToken);

            // 2. Tell Go backend to delete session in Postgres
            if (refreshToken) {
              try {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                const { authClient } = require("@/lib/api/client");
                await authClient.logout({ refreshToken });
                console.log("[SETTINGS] Backend logout successful");
              } catch (backendError) {
                // Network error is OK - we still wipe locally
                console.warn(
                  "[SETTINGS] Backend logout failed (will still clear local):",
                  backendError,
                );
              }
            }

            // 3. Clear ALL local state (tokens + Zustand + AsyncStorage)
            await clearAllAuthState();
            console.log("[SETTINGS] Local state cleared");

            // 4. Navigate to login
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { router } = require("expo-router");
            router.replace("/(auth)/login");
          } catch (error) {
            console.error("[SETTINGS] Logout error:", error);
            // Fallback: still try to clear and navigate
            try {
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const { clearAllAuthState } = require("@/lib/storage/token-storage");
              await clearAllAuthState();
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              const { router } = require("expo-router");
              router.replace("/(auth)/login");
            } catch {
              // Last resort
            }
          }
        },
      },
    ]);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <YStack paddingHorizontal={20} paddingTop={20} gap={24}>
            {/* Profile Header */}
            <YStack alignItems="center" gap={8}>
              <Avatar name="Fernando Correia" size="xl" />
              <UserName>Fernando Correia</UserName>
              <UserHandle>@fernando_echo</UserHandle>
              <UpgradeBadge marginTop={8}>
                <Text color="$accentGradientStart" fontSize={14} fontFamily="$heading">
                  ◇ Upgrade
                </Text>
              </UpgradeBadge>
            </YStack>

            {/* Plan Card */}
            <XStack gap={12}>
              <GlassyCard flex={1}>
                <YStack gap={4}>
                  <Text color="$color" fontSize={16} fontFamily="$heading">
                    Standard
                  </Text>
                  <Text color="$secondaryText" fontSize={12}>
                    Your plan
                  </Text>
                </YStack>
              </GlassyCard>
              {/* v0.1: Removed Invite Friends to focus on core loop
              <GlassyCard flex={1}>
                <YStack gap={4}>
                  <Text color="$color" fontSize={16} fontFamily="$heading">
                    Invite Friends
                  </Text>
                  <Text color="$secondaryText" fontSize={12}>
                    Earn €30 or more
                  </Text>
                </YStack>
              </GlassyCard>
              */}
            </XStack>

            {/* Main Menu */}
            <YStack
              backgroundColor="$cardBackground"
              borderRadius={16}
              borderWidth={1}
              borderColor="$borderColor"
              overflow="hidden"
            >
              {menuItems.main.map((item, _index) => (
                <ListItem
                  key={item.label}
                  title={item.label}
                  left={<item.icon size={22} color="$secondaryText" />}
                  right={
                    item.badge ? (
                      <XStack
                        backgroundColor="$accentGradientStart"
                        paddingHorizontal={8}
                        paddingVertical={2}
                        borderRadius={10}
                      >
                        <Text color="white" fontSize={12} fontFamily="$heading">
                          {item.badge}
                        </Text>
                      </XStack>
                    ) : (
                      <ChevronRight size={20} color="$secondaryText" />
                    )
                  }
                  onPress={() => {}}
                />
              ))}
            </YStack>

            {/* Settings Menu */}
            <YStack
              backgroundColor="$cardBackground"
              borderRadius={16}
              borderWidth={1}
              borderColor="$borderColor"
              overflow="hidden"
            >
              {menuItems.settings.map((item) => (
                <ListItem
                  key={item.label}
                  title={item.label}
                  left={<item.icon size={22} color="$secondaryText" />}
                  right={
                    item.hasToggle ? (
                      <ThemeToggle />
                    ) : (
                      <ChevronRight size={20} color="$secondaryText" />
                    )
                  }
                  onPress={
                    item.hasToggle
                      ? undefined
                      : () => {
                          if (item.route) router.push(`/${item.route}` as any);
                        }
                  }
                />
              ))}
            </YStack>

            {/* Footer Menu */}
            <YStack
              backgroundColor="$cardBackground"
              borderRadius={16}
              borderWidth={1}
              borderColor="$borderColor"
              overflow="hidden"
            >
              {menuItems.footer.map((item) => (
                <ListItem
                  key={item.label}
                  title={item.label}
                  left={
                    <item.icon
                      size={22}
                      color={item.isDestructive ? "#ef4444" : "$secondaryText"}
                    />
                  }
                  right={<ChevronRight size={20} color="$secondaryText" />}
                  onPress={item.route === "logout" ? handleLogout : () => {}}
                />
              ))}
            </YStack>

            <Text
              color="$secondaryText"
              fontSize={12}
              fontFamily="$body"
              textAlign="center"
              marginTop={8}
            >
              Version 0.1.0{"\n"}Echo Finance Inc.
            </Text>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
