/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors, type ColorName } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const { resolvedTheme } = useTheme();
  const colorFromProps = props[resolvedTheme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[resolvedTheme][colorName];
  }
}

/**
 * Get a specific color from the current theme
 */
export function useColor(colorName: ColorName): string {
  const { resolvedTheme } = useTheme();
  return Colors[resolvedTheme][colorName];
}

/**
 * Get all theme colors for the current mode
 */
export function useColors() {
  const { resolvedTheme } = useTheme();
  return Colors[resolvedTheme];
}
