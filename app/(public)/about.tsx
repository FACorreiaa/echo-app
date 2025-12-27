import { GlassyCard } from "@/components/GlassyCard";
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

const Heading = styled(Text, {
  color: "$color",
  fontSize: 22,
  fontFamily: "$heading",
  marginBottom: 12,
});

const Paragraph = styled(Text, {
  color: "$color",
  opacity: 0.8,
  fontSize: 16,
  fontFamily: "$body",
  lineHeight: 26,
  marginBottom: 20,
});

export default function AboutScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        <YStack maxWidth={800} width="100%" alignSelf="center" paddingTop={40}>
          <Title>About Echo</Title>
          <Subtitle>Building an Alive Money Operating System.</Subtitle>

          <GlassyCard>
            <Heading>The Problem: Passive Dashboards</Heading>
            <Paragraph>
              Most personal finance apps are just spreadsheets with better UI. They show you charts
              of what happened in the past, but they don&apos;t help you change the future. They are
              passive observers of your financial decline.
            </Paragraph>

            <Heading>Our Vision: An Alive System</Heading>
            <Paragraph>
              Echo is designed to feel alive. It doesn&apos;t just show you data; it turns that data
              into clear next actions. It catches anomalies before they become habits. It celebrates
              your wins with &quot;Money Wrapped&quot; stories that make finance feel less like a
              chore and more like a game you can win.
            </Paragraph>

            <Heading>Privacy & Trust</Heading>
            <Paragraph>
              Your financial data is the most sensitive data you own. We believe you shouldn&apos;t
              have to trade privacy for utility. Echo is built with a simple business model: you pay
              us, and we provide a service. We don&apos;t sell data. We don&apos;t show ads. We
              build tools that work for you, not for advertisers.
            </Paragraph>

            <Paragraph>
              Whether you bring your own spreadsheet or use our fully automated sync, Echo is the
              operating system designed to help you build wealth, not just track it.
            </Paragraph>
          </GlassyCard>
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
