import React from "react";
import { styled, Stack, StackProps, Text } from "tamagui";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Pressable } from "react-native";

/**
 * HUDButton - Tactical button with glitch effect on press
 */
const StyledButton = styled(Stack, {
  name: "HUDButton",
  backgroundColor: "$hudDepth",
  borderWidth: 1,
  borderColor: "$hudBorder",
  borderRadius: 4,
  paddingVertical: "$3",
  paddingHorizontal: "$4",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",

  shadowColor: "$hudGlow",
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 10,

  variants: {
    variant: {
      primary: {
        backgroundColor: "$hudActive",
        borderColor: "$hudActive",
        shadowOpacity: 0.3,
      },
      secondary: {
        backgroundColor: "$hudDepth",
        borderColor: "$hudBorder",
      },
      danger: {
        backgroundColor: "$hudWarning",
        borderColor: "$hudWarning",
        shadowColor: "$hudWarning",
        shadowOpacity: 0.2,
      },
    },
    disabled: {
      true: {
        opacity: 0.5,
      },
    },
    fullWidth: {
      true: {
        width: "100%",
      },
    },
  } as const,

  defaultVariants: {
    variant: "primary",
  },
});

interface HUDButtonProps extends Omit<StackProps, "children"> {
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const HUDButton: React.FC<HUDButtonProps> = ({
  onPress,
  variant = "primary",
  disabled = false,
  fullWidth = false,
  children,
  ...props
}) => {
  const offset = useSharedValue(0);
  const scale = useSharedValue(1);

  const triggerGlitch = () => {
    if (disabled) return;

    // Glitch effect
    offset.value = withSequence(
      withTiming(-2, { duration: 40 }),
      withTiming(2, { duration: 40 }),
      withTiming(0, { duration: 40 }),
    );

    // Scale effect
    scale.value = withSequence(
      withTiming(0.95, { duration: 60 }),
      withTiming(1, { duration: 100 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }, { scale: scale.value }],
  }));

  const handlePress = () => {
    if (disabled) return;
    triggerGlitch();
    setTimeout(onPress, 100);
  };

  return (
    <Pressable onPress={handlePress} disabled={disabled}>
      <Animated.View style={animatedStyle}>
        <StyledButton variant={variant} disabled={disabled} fullWidth={fullWidth} {...props}>
          {typeof children === "string" ? (
            <Text
              color={variant === "primary" || variant === "danger" ? "white" : "$color"}
              fontWeight="bold"
              fontSize={14}
              letterSpacing={0.5}
            >
              {children.toUpperCase()}
            </Text>
          ) : (
            children
          )}
        </StyledButton>
      </Animated.View>
    </Pressable>
  );
};
