import { GlassyCard } from "@/components/ui/GlassyCard";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, styled, Text, YStack } from "tamagui";

const Title = styled(Text, {
  color: "$color",
  fontSize: 40,
  fontFamily: "$heading",
  textAlign: "center",
  marginBottom: 10,
});

const Subtitle = styled(Text, {
  color: "$color",
  opacity: 0.7,
  fontSize: 18,
  fontFamily: "$body",
  textAlign: "center",
  marginBottom: 40,
});

const FeatureTitle = styled(Text, {
  color: "$color",
  fontSize: 24,
  fontFamily: "$heading",
  marginBottom: 10,
});

const FeatureText = styled(Text, {
  color: "$color",
  opacity: 0.8,
  fontSize: 16,
  fontFamily: "$body",
  lineHeight: 26,
});

export default function FeaturesScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 80 }}>
        <YStack maxWidth={900} width="100%" alignSelf="center" paddingTop={40}>
          <Title>Features</Title>
          <Subtitle>Built for control, designed for clarity.</Subtitle>

          <YStack space="$6">
            {/* BYOS Feature */}
            <GlassyCard>
              <FeatureTitle>Bring Your Own Spreadsheet</FeatureTitle>
              <FeatureText>
                Already have a system you love in Excel or Sheets? Echo doesn&apos;t force you to
                abandon it. Upload your template, map Echo&apos;s canonical fields (transactions,
                goals) to your named ranges, and let Echo power your sheet with live data. No macros
                required.
              </FeatureText>
            </GlassyCard>

            {/* Alive Insights */}
            <GlassyCard>
              <FeatureTitle>Alive Insights</FeatureTitle>
              <FeatureText>
                Most finance apps are passive dashboards. Echo is alive. It proactively tells you
                what changed this month, identifies anomalies (&quot;Why is groceries up
                40%?&quot;), and gives you a &quot;Money Wrapped&quot; story every single month, not
                just at year-end.
              </FeatureText>
            </GlassyCard>

            {/* Integrations */}
            <GlassyCard>
              <FeatureTitle>Global Integrations</FeatureTitle>
              <FeatureText>
                Connect securely to thousands of banks via Plaid (US/CAN/UK/EU) and other regional
                providers. Echo normalizes transaction data, cleans up merchant names, and
                categorizes spending automatically. Supports manual CSV imports for privacy
                maximalists.
              </FeatureText>
            </GlassyCard>

            {/* Security */}
            <GlassyCard>
              <FeatureTitle>Privacy First</FeatureTitle>
              <FeatureText>
                We don&apos;t sell your data. We don&apos;t show you ads. Your financial life is
                yours alone. Sensitive data is encrypted at rest and in transit.
              </FeatureText>
            </GlassyCard>
          </YStack>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
