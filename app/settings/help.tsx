import { ArrowLeft, Bug, ExternalLink, Mail, MessageCircle } from "@tamagui/lucide-icons";
import { useRouter } from "expo-router";
import { Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, Text, XStack, YStack } from "tamagui";

import { GlassyCard, GradientBackground } from "@/components";
import { ListItem } from "@/components/ListItem";

const faqItems = [
  {
    question: "How do I import my bank transactions?",
    answer:
      "Go to the Import tab and upload a CSV or Excel file from your bank. Echo will automatically detect the format and map the columns.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes! Echo processes your data locally on your device. We don't send your transaction data to external servers.",
  },
  {
    question: "What banks are supported?",
    answer:
      "Echo supports CSV exports from most Portuguese and international banks including Revolut, CGD, Santander, Millennium, and ActivoBank.",
  },
  {
    question: "How do I create a budget plan?",
    answer:
      "Navigate to the Planning tab and tap 'Create Plan'. You can either import from an Excel template or start from scratch.",
  },
];

export default function HelpScreen() {
  const router = useRouter();

  const handleContact = (type: "email" | "feedback" | "bug") => {
    const emails: Record<typeof type, string> = {
      email: "mailto:support@echo-os.live",
      feedback: "mailto:feedback@echo-os.live?subject=Echo%20Feedback",
      bug: "mailto:bugs@echo-os.live?subject=Bug%20Report",
    };
    Linking.openURL(emails[type]);
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
                Help
              </Text>
            </XStack>

            {/* Contact Options */}
            <GlassyCard padding="$0" overflow="hidden">
              <ListItem
                title="Contact Support"
                left={<Mail size={22} color="$secondaryText" />}
                right={<ExternalLink size={20} color="$secondaryText" />}
                onPress={() => handleContact("email")}
              />
              <ListItem
                title="Send Feedback"
                left={<MessageCircle size={22} color="$secondaryText" />}
                right={<ExternalLink size={20} color="$secondaryText" />}
                onPress={() => handleContact("feedback")}
              />
              <ListItem
                title="Report a Bug"
                left={<Bug size={22} color="$secondaryText" />}
                right={<ExternalLink size={20} color="$secondaryText" />}
                onPress={() => handleContact("bug")}
              />
            </GlassyCard>

            {/* FAQ Section */}
            <YStack gap={12}>
              <Text color="$color" fontSize={18} fontFamily="$heading">
                Frequently Asked Questions
              </Text>

              {faqItems.map((item, index) => (
                <GlassyCard key={index}>
                  <YStack gap={8}>
                    <Text color="$color" fontSize={14} fontFamily="$heading">
                      {item.question}
                    </Text>
                    <Text color="$secondaryText" fontSize={13} lineHeight={20}>
                      {item.answer}
                    </Text>
                  </YStack>
                </GlassyCard>
              ))}
            </YStack>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
