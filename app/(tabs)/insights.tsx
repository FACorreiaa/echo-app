import { AlertTriangle, Share2, Zap } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

import { GlassyButton } from "@/components/GlassyButton";
import { GlassyCard } from "@/components/GlassyCard";
import { GradientBackground } from "@/components/GradientBackground";
import { PromoCard } from "@/components/PromoCard";

const PageTitle = styled(Text, {
  color: "$color",
  fontSize: 28,
  fontFamily: "$heading",
});

const SectionTitle = styled(Text, {
  color: "$color",
  fontSize: 18,
  fontFamily: "$heading",
  marginBottom: 12,
});

const InsightTitle = styled(Text, {
  color: "$color",
  fontSize: 16,
  fontFamily: "$heading",
  marginBottom: 4,
});

const InsightText = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
  lineHeight: 22,
});

const StatValue = styled(Text, {
  color: "$color",
  fontSize: 32,
  fontFamily: "$heading",
});

const StatLabel = styled(Text, {
  color: "$secondaryText",
  fontSize: 14,
  fontFamily: "$body",
});

// Mock insights
const thingsChanged = [
  {
    id: "1",
    title: "Groceries up 23%",
    description: "You spent €120 more on groceries this month compared to November.",
    type: "warning",
  },
  {
    id: "2",
    title: "Subscriptions steady",
    description: "Your €67.99 in subscriptions is the same as last month.",
    type: "info",
  },
  {
    id: "3",
    title: "Transport down 15%",
    description: "Nice! You saved €18 on transport this month.",
    type: "success",
  },
];

const actionThisWeek = {
  title: "Review your Spotify subscription",
  description: "You haven't opened Spotify in 3 weeks. Consider canceling to save €9.99/month.",
};

export default function InsightsScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
          <YStack paddingHorizontal={20} paddingTop={20} gap={24}>
            {/* Header */}
            <XStack justifyContent="space-between" alignItems="center">
              <PageTitle>Insights</PageTitle>
            </XStack>

            {/* Mini Wrapped Preview */}
            <PromoCard
              title="December Wrapped"
              subtitle="Your monthly money story is ready to share!"
              gradient
              gradientColors={["#6366f1", "#8b5cf6"]}
              imageElement={<Share2 size={40} color="white" />}
              onPress={() => {}}
            />

            {/* Stats Row */}
            <XStack gap={12}>
              <GlassyCard flex={1}>
                <YStack alignItems="center" gap={4}>
                  <StatValue>€2,340</StatValue>
                  <StatLabel>Total Spent</StatLabel>
                </YStack>
              </GlassyCard>
              <GlassyCard flex={1}>
                <YStack alignItems="center" gap={4}>
                  <StatValue>47</StatValue>
                  <StatLabel>Transactions</StatLabel>
                </YStack>
              </GlassyCard>
            </XStack>

            {/* 3 Things Changed */}
            <YStack gap={12}>
              <SectionTitle>3 Things Changed</SectionTitle>
              {thingsChanged.map((insight) => (
                <GlassyCard key={insight.id}>
                  <XStack gap={12} alignItems="flex-start">
                    <YStack
                      width={36}
                      height={36}
                      borderRadius={18}
                      backgroundColor={
                        insight.type === "warning"
                          ? "rgba(234, 179, 8, 0.2)"
                          : insight.type === "success"
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(45, 166, 250, 0.2)"
                      }
                      alignItems="center"
                      justifyContent="center"
                    >
                      <AlertTriangle
                        size={18}
                        color={
                          insight.type === "warning"
                            ? "#eab308"
                            : insight.type === "success"
                              ? "#22c55e"
                              : "#2da6fa"
                        }
                      />
                    </YStack>
                    <YStack flex={1}>
                      <InsightTitle>{insight.title}</InsightTitle>
                      <InsightText>{insight.description}</InsightText>
                    </YStack>
                  </XStack>
                </GlassyCard>
              ))}
            </YStack>

            {/* Action This Week */}
            <YStack gap={12}>
              <SectionTitle>Action This Week</SectionTitle>
              <GlassyCard>
                <XStack gap={12} alignItems="flex-start">
                  <YStack
                    width={36}
                    height={36}
                    borderRadius={18}
                    backgroundColor="rgba(45, 166, 250, 0.2)"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Zap size={18} color="#2da6fa" />
                  </YStack>
                  <YStack flex={1} gap={12}>
                    <YStack>
                      <InsightTitle>{actionThisWeek.title}</InsightTitle>
                      <InsightText>{actionThisWeek.description}</InsightText>
                    </YStack>
                    <GlassyButton variant="outline">Review Subscription</GlassyButton>
                  </YStack>
                </XStack>
              </GlassyCard>
            </YStack>
          </YStack>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}
