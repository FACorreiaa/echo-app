import { ArrowLeft, ChevronRight, Edit3, Mail, Trash2, User } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, XStack, YStack } from "tamagui";

import { Avatar, GlassyCard, GradientBackground } from "@/components";
import { ListItem } from "@/components/ListItem";

export default function AccountScreen() {
  const router = useRouter();

  // TODO: Get from auth state
  const user = {
    name: "Fernando Correia",
    email: "fernando@example.com",
    handle: "@fernando_echo",
    plan: "Standard",
    memberSince: "January 2025",
  };

  const handleEditProfile = () => {
    // TODO: Implement edit profile
    Alert.alert("Coming Soon", "Profile editing will be available in a future update.");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            Alert.alert(
              "Contact Support",
              "Please contact support@echo-os.live to delete your account.",
            );
          },
        },
      ],
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <YStack paddingHorizontal={20} paddingTop={20} gap={24}>
            {/* Header */}
            <XStack alignItems="center" gap={12}>
              <XStack
                onPress={() => router.back()}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                cursor="pointer"
                padding={8}
              >
                <ArrowLeft size={24} color="$color" />
              </XStack>
              <Text color="$color" fontSize={24} fontFamily="$heading">
                Account
              </Text>
            </XStack>

            {/* Profile Card */}
            <GlassyCard>
              <YStack alignItems="center" gap={16} paddingVertical={8}>
                <Avatar name={user.name} size="xl" />
                <YStack alignItems="center" gap={4}>
                  <Text color="$color" fontSize={20} fontFamily="$heading">
                    {user.name}
                  </Text>
                  <Text color="$secondaryText" fontSize={14}>
                    {user.handle}
                  </Text>
                </YStack>
              </YStack>
            </GlassyCard>

            {/* Account Details */}
            <YStack gap={12}>
              <Text
                color="$secondaryText"
                fontSize={12}
                fontFamily="$heading"
                textTransform="uppercase"
              >
                Account Details
              </Text>
              <GlassyCard padding="$0" overflow="hidden">
                <ListItem
                  title="Email"
                  subtitle={user.email}
                  left={<Mail size={22} color="$secondaryText" />}
                />
                <ListItem
                  title="Plan"
                  subtitle={user.plan}
                  left={<User size={22} color="$secondaryText" />}
                />
                <ListItem
                  title="Member Since"
                  subtitle={user.memberSince}
                  left={<User size={22} color="$secondaryText" />}
                />
              </GlassyCard>
            </YStack>

            {/* Actions */}
            <YStack gap={12}>
              <Text
                color="$secondaryText"
                fontSize={12}
                fontFamily="$heading"
                textTransform="uppercase"
              >
                Actions
              </Text>
              <GlassyCard padding="$0" overflow="hidden">
                <ListItem
                  title="Edit Profile"
                  left={<Edit3 size={22} color="$secondaryText" />}
                  right={<ChevronRight size={20} color="$secondaryText" />}
                  onPress={handleEditProfile}
                />
                <ListItem
                  title="Delete Account"
                  left={<Trash2 size={22} color="#ef4444" />}
                  right={<ChevronRight size={20} color="$secondaryText" />}
                  onPress={handleDeleteAccount}
                />
              </GlassyCard>
            </YStack>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
