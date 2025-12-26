/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from '@react-navigation/native';

import { Colors, type ColorName } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const { dark } = useTheme();
  const resolvedTheme = dark ? 'dark' : 'light';
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
  const { dark } = useTheme();
  const resolvedTheme = dark ? 'dark' : 'light';
  return Colors[resolvedTheme][colorName];
}

/**
 * Get all theme colors for the current mode
 */
export function useColors() {
  const { dark } = useTheme();
  const resolvedTheme = dark ? 'dark' : 'light';
  return Colors[resolvedTheme];
}
