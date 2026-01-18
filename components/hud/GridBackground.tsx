import React from "react";
import { YStack } from "tamagui";
import Svg, { Defs, Pattern, Rect, Line } from "react-native-svg";

/**
 * GridBackground - Tactical OS Grid Pattern
 *
 * A subtle 20px grid background that reinforces the OS aesthetic.
 * This grid pattern adds structural depth to the interface.
 */
interface GridBackgroundProps {
  gridSize?: number;
  opacity?: number;
}

export const GridBackground: React.FC<GridBackgroundProps> = ({
  gridSize = 20,
  opacity = 0.05,
}) => {
  return (
    <YStack
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      pointerEvents="none"
      zIndex={0}
    >
      <Svg width="100%" height="100%" style={{ position: "absolute" }}>
        <Defs>
          <Pattern id="grid" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <Line
              x1="0"
              y1="0"
              x2={gridSize}
              y2="0"
              stroke="rgba(45, 166, 250, 0.15)"
              strokeWidth="0.5"
              opacity={opacity}
            />
            <Line
              x1="0"
              y1="0"
              x2="0"
              y2={gridSize}
              stroke="rgba(45, 166, 250, 0.15)"
              strokeWidth="0.5"
              opacity={opacity}
            />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grid)" />
      </Svg>
    </YStack>
  );
};
