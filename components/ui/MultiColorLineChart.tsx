/**
 * MultiColorLineChart - Tactical Line Chart with Color Segments
 *
 * Like Copilot Money's "Follow the line" chart.
 * Shows spending trends with green (under), yellow (warning), and red (over) segments.
 */

import React from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { useTheme, YStack } from "tamagui";

interface MultiColorLineChartProps {
  data: number[];
  labels: string[];
  budgetLine?: number;
  height?: number;
}

export const MultiColorLineChart: React.FC<MultiColorLineChartProps> = ({
  data,
  labels,
  budgetLine,
  height = 180,
}) => {
  const theme = useTheme();
  const screenWidth = Dimensions.get("window").width - 40;

  // Determine color segments based on budget line
  const getSegmentColors = () => {
    if (!budgetLine) return ["#10b981"];

    return data.map((value) => {
      const percentOfBudget = (value / budgetLine) * 100;
      if (percentOfBudget >= 100) return "#ef4444"; // Red (over)
      if (percentOfBudget >= 85) return "#f59e0b"; // Yellow (warning)
      return "#10b981"; // Green (under)
    });
  };

  const segmentColors = getSegmentColors();

  // Use the most severe color for the overall line
  const lineColor = segmentColors.includes("#ef4444")
    ? "#ef4444"
    : segmentColors.includes("#f59e0b")
      ? "#f59e0b"
      : "#10b981";

  return (
    <YStack>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            {
              data: data,
              color: () => lineColor,
              strokeWidth: 3,
            },
            ...(budgetLine
              ? [
                  {
                    data: Array(data.length).fill(budgetLine),
                    color: () => "rgba(45, 166, 250, 0.3)",
                    strokeWidth: 1,
                    withDots: false,
                  },
                ]
              : []),
          ],
        }}
        width={screenWidth}
        height={height}
        chartConfig={{
          backgroundColor: "transparent",
          backgroundGradientFrom: (theme.hudDepth as any)?.val || "rgba(10, 10, 15, 0.9)",
          backgroundGradientTo: (theme.hudDepth as any)?.val || "rgba(10, 10, 15, 0.9)",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(45, 166, 250, ${opacity})`,
          labelColor: (opacity = 1) =>
            `rgba(${theme.secondaryText ? "148, 163, 184" : "100, 116, 139"}, ${opacity})`,
          style: {
            borderRadius: 8,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: lineColor,
          },
          propsForBackgroundLines: {
            strokeDasharray: "",
            stroke: "rgba(45, 166, 250, 0.1)",
            strokeWidth: 1,
          },
        }}
        bezier
        style={{
          borderRadius: 8,
          paddingRight: 0,
        }}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        fromZero
      />
    </YStack>
  );
};

/**
 * SpendingTrendChart - Displays daily spending with budget threshold
 */
interface SpendingTrendChartProps {
  dailySpending: { day: string; amount: number }[];
  monthlyBudget: number;
  daysInMonth: number;
}

export const SpendingTrendChart: React.FC<SpendingTrendChartProps> = ({
  dailySpending,
  monthlyBudget,
  daysInMonth,
}) => {
  const dailyBudget = monthlyBudget / daysInMonth;

  // Prepare chart data
  const data = dailySpending.map((d) => d.amount);
  const labels = dailySpending.map((d) => d.day);

  return <MultiColorLineChart data={data} labels={labels} budgetLine={dailyBudget} />;
};
