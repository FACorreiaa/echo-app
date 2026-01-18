import { BarChart3, Cpu, Home, Upload, Wallet } from "@tamagui/lucide-icons";
import React from "react";
import { Pressable } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Stack, Text, useTheme, XStack } from "tamagui";

/**
 * HUDNavItem - Individual navigation item with glitch effect
 */
interface HUDNavItemProps {
  Icon: any; // Tamagui icon components
  label: string;
  isActive: boolean;
  onPress: () => void;
}

const HUDNavItem: React.FC<HUDNavItemProps> = ({ Icon, label, isActive, onPress }) => {
  const offset = useSharedValue(0);
  const opacity = useSharedValue(1);
  const theme = useTheme();

  const triggerGlitch = () => {
    // Rapid sequence of offsets to mimic a digital glitch
    offset.value = withSequence(
      withTiming(-3, { duration: 50 }),
      withTiming(3, { duration: 50 }),
      withTiming(-2, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
    opacity.value = withSequence(
      withTiming(0.4, { duration: 50 }),
      withTiming(1, { duration: 150 }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
    opacity: opacity.value,
  }));

  const handlePress = () => {
    triggerGlitch();
    // Small delay to let animation play before navigation
    setTimeout(onPress, 100);
  };

  const iconColor = isActive ? theme.hudActive?.val : (theme.secondaryText?.val ?? "#636366");

  return (
    <Pressable onPress={handlePress}>
      <Stack alignItems="center" justifyContent="center" paddingHorizontal="$2">
        <Animated.View style={animatedStyle}>
          <Icon size={22} color={iconColor} />
        </Animated.View>
        <Text
          fontSize={9}
          color={isActive ? "$hudActive" : "$secondaryText"}
          marginTop={2}
          fontWeight="bold"
          letterSpacing={0.5}
        >
          {label.toUpperCase()}
        </Text>
      </Stack>
    </Pressable>
  );
};

/**
 * CommandBar - Adaptive Navigation Bar
 *
 * Adapts to both light and dark themes using theme tokens.
 */
interface CommandBarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const CommandBar: React.FC<CommandBarProps> = ({ activeTab, onNavigate }) => {
  return (
    <XStack
      position="absolute"
      bottom={30}
      left={20}
      right={20}
      height={60}
      backgroundColor="$hudDepth"
      borderWidth={1}
      borderColor="$hudBorder"
      borderRadius={12}
      paddingHorizontal="$3"
      alignItems="center"
      justifyContent="space-around"
      shadowColor="$shadowColor"
      shadowRadius={16}
      shadowOpacity={0.15}
      shadowOffset={{ width: 0, height: 4 }}
    >
      {/* Top Accent Line */}
      <Stack
        position="absolute"
        top={-1}
        left="15%"
        right="15%"
        height={2}
        backgroundColor="$hudActive"
        borderRadius={1}
        shadowColor="$hudActive"
        shadowRadius={8}
        shadowOpacity={0.6}
      />

      <HUDNavItem
        Icon={Home}
        label="Status"
        isActive={activeTab === "index"}
        onPress={() => onNavigate("index")}
      />
      <HUDNavItem
        Icon={BarChart3}
        label="Assets"
        isActive={activeTab === "insights"}
        onPress={() => onNavigate("insights")}
      />
      <HUDNavItem
        Icon={Wallet}
        label="Budget"
        isActive={activeTab === "planning"}
        onPress={() => onNavigate("planning")}
      />
      <HUDNavItem
        Icon={Upload}
        label="Import"
        isActive={activeTab === "import"}
        onPress={() => onNavigate("import")}
      />
      <HUDNavItem
        Icon={Cpu}
        label="System"
        isActive={activeTab === "settings"}
        onPress={() => onNavigate("settings")}
      />
    </XStack>
  );
};
