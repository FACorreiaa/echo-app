import { Moon, Sun } from "@tamagui/lucide-icons";
import { Button, styled } from "tamagui";
import { useTheme } from "@/contexts/ThemeContext";

const ToggleButton = styled(Button, {
  size: "$3",
  circular: true,
  backgroundColor: "$background", // Will adapt to theme
  borderColor: "$borderColor",
  borderWidth: 1,
  hoverStyle: {
    backgroundColor: "$backgroundHover",
  },
  pressStyle: {
    backgroundColor: "$backgroundPress",
  },
});

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <ToggleButton onPress={toggleTheme}>
      {resolvedTheme === "dark" ? (
        <Moon size={18} color="$color" />
      ) : (
        <Sun size={18} color="$color" />
      )}
    </ToggleButton>
  );
}
