import { GlassyButton } from "@/components/GlassyButton";
import { GlassyCard } from "@/components/GlassyCard";
import { Check } from "@tamagui/lucide-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, XStack, YStack } from "tamagui";

const Title = styled(Text, {
  color: "$color",
  fontSize: 40,
  fontFamily: "Outfit_700Bold",
  textAlign: "center",
  marginBottom: 10,
});

const Subtitle = styled(Text, {
  color: "$color",
  opacity: 0.7,
  fontSize: 18,
  fontFamily: "Outfit_400Regular",
  textAlign: "center",
  marginBottom: 40,
});

const PriceAmount = styled(Text, {
  color: "$color",
  fontSize: 36,
  fontFamily: "Outfit_700Bold",
  textAlign: "center",
  marginBottom: 4,
});

const PricePeriod = styled(Text, {
  color: "$color",
  opacity: 0.6,
  fontSize: 14,
  fontFamily: "Outfit_400Regular",
  textAlign: "center",
  marginBottom: 20,
});

const FeatureItem = ({ text }: { text: string }) => (
  <XStack space="$3" alignItems="center">
    <Check size={18} color="$electricBlue" />
    <Text color="$color" fontSize={16} fontFamily="Outfit_400Regular" opacity={0.9}>
      {text}
    </Text>
  </XStack>
);

export default function PricingScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <YStack maxWidth={1000} width="100%" alignSelf="center" paddingTop={40}>
          <Title>Simple Pricing</Title>
          <Subtitle>Start for free. Upgrade for the full operating system.</Subtitle>

          <YStack
            space="$6"
            $gtMd={{ flexDirection: "row", alignItems: "stretch", justifyContent: "center" }}
          >
            {/* Standard / Free Tier */}
            <YStack flex={1} maxWidth={400} width="100%">
              <GlassyCard height="100%">
                <YStack space="$4" flex={1}>
                  <Text color="$color" fontSize={22} fontFamily="Outfit_700Bold" textAlign="center">
                    Standard
                  </Text>
                  <PriceAmount>Free</PriceAmount>
                  <PricePeriod>Forever</PricePeriod>

                  <YStack space="$3" marginBottom={20}>
                    <FeatureItem text="Manual Transaction Entry" />
                    <FeatureItem text="CSV / Spreadsheet Import" />
                    <FeatureItem text="Basic Monthly Summary" />
                    <FeatureItem text="Privacy-first Storage" />
                  </YStack>

                  <YStack marginTop="auto">
                    <GlassyButton variant="outline">Get Started</GlassyButton>
                  </YStack>
                </YStack>
              </GlassyCard>
            </YStack>

            {/* Premium Tier */}
            <YStack flex={1} maxWidth={400} width="100%">
              <GlassyCard height="100%">
                <YStack space="$4" flex={1}>
                  <Text
                    color="$electricBlue"
                    fontSize={22}
                    fontFamily="Outfit_700Bold"
                    textAlign="center"
                  >
                    Echo Pro
                  </Text>
                  <PriceAmount>$9.99</PriceAmount>
                  <PricePeriod>per month</PricePeriod>

                  <YStack space="$3" marginBottom={20}>
                    <FeatureItem text="Automatic Bank Sync (Plaid/GoCardless)" />
                    <FeatureItem text="Money Wrapped & Yearly Audit" />
                    <FeatureItem text="Goal Pacing & Smart Nudges" />
                    <FeatureItem text="Subscription Hunting" />
                    <FeatureItem text="Unlimited History" />
                  </YStack>

                  <YStack marginTop="auto">
                    <GlassyButton>Start 14 Day Trial</GlassyButton>
                  </YStack>
                </YStack>
              </GlassyCard>
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
