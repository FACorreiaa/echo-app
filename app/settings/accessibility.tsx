import { ArrowLeft, ChevronRight, Contrast, Type, Zap } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Switch, Text, XStack, YStack } from "tamagui";

import { GlassyCard, GradientBackground } from "@/components";
import { ListItem } from "@/components/ListItem";

export default function AccessibilityScreen() {
  const router = useRouter();

  const handleComingSoon = (feature: string) => {
    Alert.alert("Coming Soon", `${feature} will be available in a future update.`);
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
                Accessibility
              </Text>
            </XStack>

            {/* Description */}
            <Text color="$secondaryText" fontSize={14} lineHeight={20}>
              Customize Echo to make it easier to use. These settings are designed to improve
              readability and reduce visual complexity.
            </Text>

            {/* Display Settings */}
            <YStack gap={12}>
              <Text
                color="$secondaryText"
                fontSize={12}
                fontFamily="$heading"
                textTransform="uppercase"
              >
                Display
              </Text>
              <GlassyCard padding="$0" overflow="hidden">
                <ListItem
                  title="Font Size"
                  subtitle="Adjust text size throughout the app"
                  left={<Type size={22} color="$secondaryText" />}
                  right={
                    <XStack alignItems="center" gap={8}>
                      <Text color="$secondaryText" fontSize={12}>
                        Default
                      </Text>
                      <ChevronRight size={20} color="$secondaryText" />
                    </XStack>
                  }
                  onPress={() => handleComingSoon("Font Size adjustment")}
                />
                <ListItem
                  title="High Contrast Mode"
                  subtitle="Increase contrast for better visibility"
                  left={<Contrast size={22} color="$secondaryText" />}
                  right={
                    <Switch
                      size="$3"
                      disabled
                      onCheckedChange={() => handleComingSoon("High Contrast Mode")}
                    />
                  }
                />
              </GlassyCard>
            </YStack>

            {/* Motion Settings */}
            <YStack gap={12}>
              <Text
                color="$secondaryText"
                fontSize={12}
                fontFamily="$heading"
                textTransform="uppercase"
              >
                Motion
              </Text>
              <GlassyCard padding="$0" overflow="hidden">
                <ListItem
                  title="Reduce Motion"
                  subtitle="Minimize animations and transitions"
                  left={<Zap size={22} color="$secondaryText" />}
                  right={
                    <Switch
                      size="$3"
                      disabled
                      onCheckedChange={() => handleComingSoon("Reduce Motion")}
                    />
                  }
                />
              </GlassyCard>
            </YStack>

            {/* Coming Soon Notice */}
            <GlassyCard backgroundColor="rgba(45, 166, 250, 0.1)">
              <YStack gap={8}>
                <Text color="$accentColor" fontSize={14} fontFamily="$heading">
                  More Options Coming Soon
                </Text>
                <Text color="$secondaryText" fontSize={13} lineHeight={18}>
                  We're working on additional accessibility features including screen reader
                  improvements, haptic feedback customization, and voice control.
                </Text>
              </YStack>
            </GlassyCard>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
