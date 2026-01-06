import { useRouter } from "expo-router";
import { ScrollView, styled, Text, YStack } from "tamagui";

import { GlassyButton } from "@/components/ui/GlassyButton";
import { GlassyCard } from "@/components/ui/GlassyCard";

const Title = styled(Text, {
  color: "$color",
  fontSize: 64,
  fontFamily: "$heading",
  textAlign: "center",
  marginBottom: 16,
  lineHeight: 72,
  $sm: { fontSize: 48, lineHeight: 56 },
});

const Subtitle = styled(Text, {
  color: "$color", // Rely on opacity less, or use a specific secondary color
  opacity: 0.85, // Increased from 0.7 for better legibility
  fontSize: 20,
  fontFamily: "$body",
  textAlign: "center",
  marginBottom: 48,
  maxWidth: 600,
  alignSelf: "center",
  lineHeight: 30,
});

const SectionTitle = styled(Text, {
  color: "$color",
  fontSize: 36,
  fontFamily: "$heading",
  textAlign: "center",
  marginBottom: 50,
  marginTop: 100,
});

const CardTitle = styled(Text, {
  color: "$color",
  fontSize: 20,
  fontFamily: "$heading",
  marginBottom: 8,
});

const CardText = styled(Text, {
  color: "$color",
  opacity: 0.9, // Increased from 0.8 for better contrast
  fontSize: 16,
  fontFamily: "$body",
  lineHeight: 24,
});

const FadeInStack = styled(YStack, {
  animation: "medium",
  enterStyle: {
    opacity: 0,
    y: 20,
  },
  opacity: 1,
  y: 0,
});

const FadeInView = (props: React.ComponentProps<typeof YStack> & { delay?: number }) => {
  return <FadeInStack {...props} />;
};

export default function LandingScreen() {
  const router = useRouter();

  return (
    <YStack flex={1}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <YStack
          paddingHorizontal={20}
          paddingTop={120}
          flex={1}
          maxWidth={1200}
          width="100%"
          alignSelf="center"
        >
          {/* HERO SECTION */}
          <FadeInView>
            <Title>Echo</Title>
            <Subtitle>
              The Alive Money OS that turns your transaction data into clear next actions.
            </Subtitle>

            <YStack space="$4" alignItems="center" width="100%" marginTop={10}>
              <YStack
                width="100%"
                space="$4"
                alignItems="center"
                $gtSm={{ flexDirection: "row", justifyContent: "center", width: "auto" }}
              >
                <YStack width="100%" $gtSm={{ width: 220 }}>
                  <GlassyButton
                    onPress={() => {
                      /* Start Trial */
                    }}
                  >
                    Start Free Trial
                  </GlassyButton>
                </YStack>

                <YStack width="100%" $gtSm={{ width: 140 }}>
                  <GlassyButton variant="outline" onPress={() => router.push("/(auth)/login")}>
                    Login
                  </GlassyButton>
                </YStack>
              </YStack>

              <Text color="$color" opacity={0.6} fontSize={12} marginTop={10}>
                No credit card required. 14-day free trial.
              </Text>
            </YStack>
          </FadeInView>

          {/* PILLARS SECTION */}
          <FadeInView marginTop={20}>
            <SectionTitle>The 6 Pillars</SectionTitle>

            <YStack
              space="$4"
              $gtMd={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              {/* Row 1 */}
              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Your Money Wrapped</CardTitle>
                  <CardText>
                    Personalized monthly and yearly recaps with fun, useful stats. See your story
                    unfold every single month.
                  </CardText>
                </GlassyCard>
              </YStack>

              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Yearly Audit</CardTitle>
                  <CardText>
                    Spot trends and anomalies instantly. Ask &quot;why is this 40% higher?&quot; and
                    get answers in plain English.
                  </CardText>
                </GlassyCard>
              </YStack>

              {/* Row 2 */}
              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Financial Foundation</CardTitle>
                  <CardText>
                    Your net worth, runway, and emergency fund health in one clear view. Know
                    exactly where you stand.
                  </CardText>
                </GlassyCard>
              </YStack>

              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Free Money</CardTitle>
                  <CardText>
                    We hunt for subscriptions, hidden fees, and interest optimization opportunities
                    you might be missing.
                  </CardText>
                </GlassyCard>
              </YStack>

              {/* Row 3 */}
              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Clear Goals</CardTitle>
                  <CardText>
                    Track buckets and timelines with real pacing alerts. Know if you are ahead or
                    behind plan before it&apos;s too late.
                  </CardText>
                </GlassyCard>
              </YStack>

              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Money OS</CardTitle>
                  <CardText>
                    Automate good decisions with rules and tasks. Turn your finances into a
                    self-driving system.
                  </CardText>
                </GlassyCard>
              </YStack>
            </YStack>
          </FadeInView>
        </YStack>
      </ScrollView>
    </YStack>
  );
}
