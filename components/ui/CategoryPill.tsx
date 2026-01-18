/**
 * CategoryPill - Tactical Category Badge Component
 *
 * Displays transaction categories with colored pills like Copilot Money.
 * Uses uppercase labels, icons, and category-specific colors for instant recognition.
 *
 * @example
 * <CategoryPill category="groceries" />
 * <CategoryPill category="entertainment" size="sm" />
 */

import { getCategoryConfig } from "@/lib/constants/categories";
import React from "react";
import { Text, XStack } from "tamagui";

interface CategoryPillProps {
  category: string | undefined;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  variant?: "default" | "outline";
}

export const CategoryPill: React.FC<CategoryPillProps> = ({
  category,
  size = "md",
  showIcon = true,
  variant = "default",
}) => {
  const config = getCategoryConfig(category);

  const sizes = {
    sm: { height: 20, paddingX: 8, fontSize: 10, iconSize: 12 },
    md: { height: 24, paddingX: 10, fontSize: 11, iconSize: 14 },
    lg: { height: 28, paddingX: 12, fontSize: 12, iconSize: 16 },
  };

  const { height, paddingX, fontSize, iconSize } = sizes[size];

  if (variant === "outline") {
    return (
      <XStack
        height={height}
        paddingHorizontal={paddingX}
        borderRadius={4}
        borderWidth={1}
        borderColor={config.color as any}
        backgroundColor="transparent"
        alignItems="center"
        gap={4}
      >
        {showIcon && (
          <Text fontSize={iconSize} lineHeight={iconSize}>
            {config.icon}
          </Text>
        )}
        <Text
          color={config.color as any}
          fontSize={fontSize}
          fontWeight="700"
          letterSpacing={0.5}
          lineHeight={fontSize}
        >
          {config.label}
        </Text>
      </XStack>
    );
  }

  return (
    <XStack
      height={height}
      paddingHorizontal={paddingX}
      borderRadius={4}
      backgroundColor={config.bgColor as any}
      alignItems="center"
      gap={4}
    >
      {showIcon && (
        <Text fontSize={iconSize} lineHeight={iconSize}>
          {config.icon}
        </Text>
      )}
      <Text
        color={config.color as any}
        fontSize={fontSize}
        fontWeight="700"
        letterSpacing={0.5}
        lineHeight={fontSize}
      >
        {config.label}
      </Text>
    </XStack>
  );
};

/**
 * CategoryPillGroup - Display multiple category pills
 */
interface CategoryPillGroupProps {
  categories: string[];
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
}

export const CategoryPillGroup: React.FC<CategoryPillGroupProps> = ({
  categories,
  maxVisible = 3,
  size = "sm",
}) => {
  const visible = categories.slice(0, maxVisible);
  const remaining = categories.length - maxVisible;

  return (
    <XStack gap={6} flexWrap="wrap">
      {visible.map((cat) => (
        <CategoryPill key={cat} category={cat} size={size} />
      ))}
      {remaining > 0 && (
        <XStack
          height={20}
          paddingHorizontal={8}
          borderRadius={4}
          backgroundColor="rgba(100, 116, 139, 0.15)"
          alignItems="center"
        >
          <Text color="#64748b" fontSize={10} fontWeight="700" letterSpacing={0.5}>
            +{remaining}
          </Text>
        </XStack>
      )}
    </XStack>
  );
};
