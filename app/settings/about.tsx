import { ArrowLeft, ExternalLink, Github, Globe } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Image, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, XStack, YStack } from "tamagui";

import { GlassyCard, GradientBackground } from "@/components";
import { ListItem } from "@/components/ListItem";

export default function AboutScreen() {
  const router = useRouter();

  const handleOpenLink = (url: string) => {
    Linking.openURL(url);
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
                About Echo
              </Text>
            </XStack>

            {/* Logo and Version */}
            <YStack alignItems="center" gap={16} paddingVertical={24}>
              <Image
                source={require("@/assets/images/echo-logo.png")}
                style={{ width: 120, height: 120 }}
                resizeMode="contain"
              />
              <YStack alignItems="center" gap={4}>
                <Text color="$color" fontSize={14}>
                  Version 0.1.0
                </Text>
                <Text color="$secondaryText" fontSize={12}>
                  © 2025 Echo Finance Inc.
                </Text>
              </YStack>
            </YStack>

            {/* Philosophy */}
            <GlassyCard>
              <YStack gap={12}>
                <Text color="$color" fontSize={18} fontFamily="$heading">
                  Private Intelligence
                </Text>
                <Text color="$secondaryText" fontSize={14} lineHeight={22}>
                  Echo is a personal finance OS that keeps your data private. Unlike cloud-based
                  solutions, Echo uses on-device intelligence to analyze your finances without
                  sending sensitive data to external servers.
                </Text>
                <Text color="$secondaryText" fontSize={14} lineHeight={22}>
                  Your money, your rules, your privacy.
                </Text>
              </YStack>
            </GlassyCard>

            {/* Links */}
            <GlassyCard padding="$0" overflow="hidden">
              <ListItem
                title="Visit Website"
                left={<Globe size={22} color="$secondaryText" />}
                right={<ExternalLink size={20} color="$secondaryText" />}
                onPress={() => handleOpenLink("https://echo-os.live")}
              />
              <ListItem
                title="Privacy Policy"
                left={<ExternalLink size={22} color="$secondaryText" />}
                right={<ExternalLink size={20} color="$secondaryText" />}
                onPress={() => handleOpenLink("https://echo-os.live/privacy")}
              />
              <ListItem
                title="Terms of Service"
                left={<ExternalLink size={22} color="$secondaryText" />}
                right={<ExternalLink size={20} color="$secondaryText" />}
                onPress={() => handleOpenLink("https://echo-os.live/terms")}
              />
              <ListItem
                title="Open Source Libraries"
                left={<Github size={22} color="$secondaryText" />}
                right={<ExternalLink size={20} color="$secondaryText" />}
                onPress={() => handleOpenLink("https://github.com/FACorreiaa/echo-app")}
              />
            </GlassyCard>

            {/* Tech Stack */}
            <GlassyCard>
              <YStack gap={8}>
                <Text color="$color" fontSize={14} fontFamily="$heading">
                  Built With
                </Text>
                <XStack flexWrap="wrap" gap={8}>
                  {["React Native", "Expo", "Tamagui", "Go", "PostgreSQL"].map((tech) => (
                    <Text
                      key={tech}
                      backgroundColor="$backgroundHover"
                      color="$secondaryText"
                      paddingHorizontal={12}
                      paddingVertical={6}
                      borderRadius={16}
                      fontSize={12}
                    >
                      {tech}
                    </Text>
                  ))}
                </XStack>
              </YStack>
            </GlassyCard>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
