/**
 * BentoGrid - Responsive grid container for Bento-style dashboard
 *
 * Usage:
 * <BentoGrid>
 *   <BentoCard size="wide">...</BentoCard>
 *   <BentoCard size="small">...</BentoCard>
 * </BentoGrid>
 */

import React from "react";
import { useWindowDimensions } from "react-native";
import { YStack } from "tamagui";

interface BentoGridProps {
  children: React.ReactNode;
  gap?: number;
}

export function BentoGrid({ children, gap = 12 }: BentoGridProps) {
  const { width } = useWindowDimensions();

  // Responsive columns: 2 on mobile, 3 on tablet, 4 on desktop
  const columns = width < 600 ? 2 : width < 1024 ? 3 : 4;

  // Calculate item width based on columns
  const containerPadding = 20;
  const totalGap = gap * (columns - 1);
  const itemWidth = (width - containerPadding * 2 - totalGap) / columns;

  return (
    <YStack flexDirection="row" flexWrap="wrap" gap={gap} width="100%">
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // Get size from child props
        const size = (child.props as { size?: string }).size || "small";

        // Calculate width based on size
        let cardWidth = itemWidth;
        if (size === "wide") {
          cardWidth = itemWidth * 2 + gap;
        }
        if (size === "full") {
          cardWidth = width - containerPadding * 2;
        }

        return React.cloneElement(child as React.ReactElement<{ style?: object }>, {
          style: { width: cardWidth, minWidth: cardWidth },
        });
      })}
    </YStack>
  );
}
