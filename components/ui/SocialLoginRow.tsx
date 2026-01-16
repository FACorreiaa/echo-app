import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet } from "react-native";
import { Text, XStack, YStack } from "tamagui";

// Glass Icon Button - circular with glassmorphism effect
// const GlassIconButtonContainer = styled(YStack, {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: "rgba(255, 255, 255, 0.08)",
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.15)",
//     alignItems: "center",
//     justifyContent: "center",
//     pressStyle: {
//         backgroundColor: "rgba(255, 255, 255, 0.15)",
//         scale: 0.95,
//     },
// });

interface GlassIconButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

const GlassIconButton = ({ icon, label, onPress }: GlassIconButtonProps) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel={label}
    style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
  >
    {icon}
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    transform: [{ scale: 0.95 }],
  },
});

interface SocialLoginRowProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
  onFacebookPress?: () => void;
  onXPress?: () => void;
  onPhonePress?: () => void;
}

export const SocialLoginRow = ({
  onGooglePress,
  onApplePress,
  onFacebookPress,
  onXPress,
  onPhonePress,
}: SocialLoginRowProps) => {
  const iconSize = 20;
  const iconColor = "white";

  return (
    <YStack gap="$3" alignItems="center" width="100%">
      {/* Divider text */}
      <Text
        fontSize={12}
        color="rgba(255, 255, 255, 0.5)"
        fontWeight="600"
        letterSpacing={1}
        textTransform="uppercase"
      >
        Or continue with
      </Text>

      {/* Horizontal row of buttons */}
      <XStack gap="$3" width="100%" justifyContent="center" flexWrap="nowrap">
        {/* Google */}
        <GlassIconButton
          label="Sign in with Google"
          onPress={onGooglePress}
          icon={<FontAwesome5 name="google" size={iconSize} color={iconColor} />}
        />

        {/* Apple */}
        <GlassIconButton
          label="Sign in with Apple"
          onPress={onApplePress}
          icon={<FontAwesome5 name="apple" size={iconSize + 2} color={iconColor} />}
        />

        {/* Facebook */}
        <GlassIconButton
          label="Sign in with Facebook"
          onPress={onFacebookPress}
          icon={<FontAwesome5 name="facebook-f" size={iconSize} color={iconColor} />}
        />

        {/* X (Twitter) */}
        <GlassIconButton
          label="Sign in with X"
          onPress={onXPress}
          icon={<FontAwesome5 name="twitter" size={iconSize} color={iconColor} />}
        />

        {/* Phone */}
        <GlassIconButton
          label="Sign in with Phone"
          onPress={onPhonePress}
          icon={<Ionicons name="call" size={iconSize} color={iconColor} />}
        />
      </XStack>
    </YStack>
  );
};

export default SocialLoginRow;
