import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { ScrollView, styled, Text, YStack } from "tamagui";

import { GlassyButton } from "@/components/GlassyButton";
import { GlassyCard } from "@/components/GlassyCard";

// Use $color which adapts to theme
const Title = styled(Text, {
  color: "$color",
  fontSize: 48,
  fontFamily: "Outfit_700Bold",
  textAlign: "center",
  marginBottom: 8,
});

const Subtitle = styled(Text, {
  color: "$color",
  opacity: 0.6,
  fontSize: 18,
  fontFamily: "Outfit_400Regular",
  textAlign: "center",
  marginBottom: 40,
});

const SectionTitle = styled(Text, {
  color: "$color",
  fontSize: 32,
  fontFamily: "Outfit_700Bold",
  textAlign: "center",
  marginBottom: 40,
  marginTop: 80,
});

const CardTitle = styled(Text, {
  color: "$color",
  fontSize: 20,
  fontFamily: "Outfit_700Bold",
  marginBottom: 8,
});

const CardText = styled(Text, {
  color: "$color",
  opacity: 0.8,
  fontSize: 16,
  fontFamily: "Outfit_400Regular",
  lineHeight: 24,
});

const FadeInView = (props: React.ComponentProps<typeof YStack> & { delay?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        delay: props.delay || 0,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        delay: props.delay || 0,
      }),
    ]).start();
  }, [fadeAnim, translateY, props.delay]);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }], flex: 1 }}>
      <YStack {...props} />
    </Animated.View>
  );
};

export default function LandingScreen() {
  const router = useRouter();

  return (
    <YStack flex={1}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}>
        <YStack
          paddingHorizontal={20}
          paddingTop={100}
          flex={1}
          maxWidth={1200}
          width="100%"
          alignSelf="center"
        >
          {/* HERO SECTION */}
          <FadeInView delay={0}>
            <Title>Echo</Title>
            <Subtitle>Alive Money OS</Subtitle>

            <YStack space="$4" alignItems="center" width="100%" marginTop={20}>
              <YStack width="100%" $gtMd={{ width: 400 }} space="$4">
                <GlassyButton
                  onPress={() => {
                    /* Start Trial */
                  }}
                >
                  Start 14 day free trial
                </GlassyButton>
                <GlassyButton variant="outline" onPress={() => router.push("/(auth)/login")}>
                  Login
                </GlassyButton>
              </YStack>
            </YStack>
          </FadeInView>

          {/* PILLARS SECTION */}
          <FadeInView delay={500}>
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
                    unfold.
                  </CardText>
                </GlassyCard>
              </YStack>

              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Yearly Audit</CardTitle>
                  <CardText>
                    Spot trends and anomalies instantly. Ask &quot;why is this 40% higher?&quot; and
                    get answers.
                  </CardText>
                </GlassyCard>
              </YStack>

              {/* Row 2 */}
              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Financial Foundation</CardTitle>
                  <CardText>
                    Your net worth, runway, and emergency fund health in one clear view.
                  </CardText>
                </GlassyCard>
              </YStack>

              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Free Money</CardTitle>
                  <CardText>
                    We hunt for subscriptions, hidden fees, and interest optimization opportunities.
                  </CardText>
                </GlassyCard>
              </YStack>

              {/* Row 3 */}
              <YStack space="$4" width="100%" $gtMd={{ width: "48%" }}>
                <GlassyCard>
                  <CardTitle>Clear Goals</CardTitle>
                  <CardText>
                    Track buckets and timelines with real pacing alerts. Know if you are ahead or
                    behind plan.
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
