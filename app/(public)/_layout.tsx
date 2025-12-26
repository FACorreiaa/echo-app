import { GradientBackground } from "@/components/GradientBackground";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X } from "@tamagui/lucide-icons";
import { Link, Slot, usePathname } from "expo-router";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, styled, Text, XStack, YStack } from "tamagui";

const NavLinkText = styled(Text, {
  color: "$colorHover",
  fontSize: 16,
  fontFamily: "Outfit_500Medium",
  hoverStyle: {
    color: "$color",
    cursor: "pointer",
  },
  pressStyle: {
    opacity: 0.7,
  },
});

const MobileNavLinkText = styled(Text, {
  color: "$color",
  fontSize: 24,
  fontFamily: "Outfit_700Bold",
  paddingVertical: 10,
});

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href === "/(public)" && pathname === "/");

  return (
    <Link href={href} asChild>
      <NavLinkText color={isActive ? "$color" : "$colorHover"}>{children}</NavLinkText>
    </Link>
  );
};

const MobileNavLink = ({
  href,
  children,
  onPress,
}: {
  href: string;
  children: React.ReactNode;
  onPress: () => void;
}) => {
  return (
    <Link href={href} asChild onPress={onPress}>
      <MobileNavLinkText>{children}</MobileNavLinkText>
    </Link>
  );
};

export default function PublicLayout() {
  //const theme = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <GradientBackground>
      <YStack flex={1}>
        {/* Navbar */}
        {/* We use backgroundColor: 'transparent' to let gradient show through */}
        <SafeAreaView edges={["top"]} style={{ backgroundColor: "transparent", zIndex: 100 }}>
          <XStack
            paddingHorizontal={20}
            paddingVertical={16}
            alignItems="center"
            justifyContent="space-between"
            zIndex={101}
          >
            {/* Left: Logo */}
            <XStack alignItems="center" space="$4">
              <Link href="/(public)" asChild>
                <Text color="$color" fontSize={24} fontFamily="Outfit_700Bold" cursor="pointer">
                  Echo
                </Text>
              </Link>
            </XStack>

            {/* Middle: Desktop Nav */}
            <XStack space="$5" display="none" $gtSm={{ display: "flex" }} alignItems="center">
              <NavLink href="/(public)">Home</NavLink>
              <NavLink href="/(public)/features">Features</NavLink>
              <NavLink href="/(public)/pricing">Pricing</NavLink>
              <NavLink href="/(public)/about">About</NavLink>
            </XStack>

            {/* Right: Actions */}
            <XStack space="$3" alignItems="center">
              <ThemeToggle />

              <Link href="/(auth)/login" asChild>
                <Button
                  size="$3"
                  theme="active"
                  backgroundColor="rgba(255,255,255,0.1)"
                  color="$color"
                  borderColor="$borderColor"
                  borderWidth={1}
                  hoverStyle={{ backgroundColor: "$backgroundHover", borderColor: "$borderColor" }}
                  cursor="pointer"
                  display="none"
                  $gtXs={{ display: "flex" }} // Hide on very small screens if needed, or keep
                >
                  Login
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                size="$3"
                icon={isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                circular
                backgroundColor="transparent"
                onPress={() => setIsMenuOpen(!isMenuOpen)}
                display="flex"
                $gtSm={{ display: "none" }}
                color="$color"
              />
            </XStack>
          </XStack>
        </SafeAreaView>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <YStack
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={99}
            backgroundColor="$background" // Solid background for legibility
            paddingTop={100}
            paddingHorizontal={30}
            animation="quick"
          >
            {/* Re-add gradient background to menu if we want it immersive,
                             but solid background is safer for readability in a modal. 
                             Let's stick to theme background. */}
            <YStack space="$4" alignItems="center">
              <MobileNavLink href="/(public)" onPress={() => setIsMenuOpen(false)}>
                Home
              </MobileNavLink>
              <MobileNavLink href="/(public)/features" onPress={() => setIsMenuOpen(false)}>
                Features
              </MobileNavLink>
              <MobileNavLink href="/(public)/pricing" onPress={() => setIsMenuOpen(false)}>
                Pricing
              </MobileNavLink>
              <MobileNavLink href="/(public)/about" onPress={() => setIsMenuOpen(false)}>
                About
              </MobileNavLink>

              <YStack height={20} />

              <Link href="/(auth)/login" asChild onPress={() => setIsMenuOpen(false)}>
                <Button
                  size="$4"
                  theme="active"
                  width="100%"
                  backgroundColor="$color"
                  color="$background"
                  fontFamily="Outfit_700Bold"
                >
                  Login to Echo
                </Button>
              </Link>
            </YStack>
          </YStack>
        )}

        <Slot />
      </YStack>
    </GradientBackground>
  );
}
