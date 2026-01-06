import { AlertCircle, Check, FileSpreadsheet } from "@tamagui/lucide-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Spinner, Text, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";

interface ImportProgressProps {
  status: "idle" | "uploading" | "analyzing" | "importing" | "success" | "error";
  progress?: number;
  rowsTotal?: number;
  rowsImported?: number;
  rowsFailed?: number;
  errorMessage?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const ImportProgress = ({
  status,
  progress = 0,
  rowsTotal = 0,
  rowsImported = 0,
  rowsFailed = 0,
  errorMessage,
}: ImportProgressProps) => {
  const getStatusMessage = () => {
    switch (status) {
      case "uploading":
        return "Uploading file...";
      case "analyzing":
        return "Analyzing file structure...";
      case "importing":
        return `Importing transactions... ${rowsImported} of ${rowsTotal}`;
      case "success":
        return rowsFailed > 0
          ? `Import complete! ${rowsImported} imported, ${rowsFailed} skipped.`
          : `Successfully imported ${rowsImported} transactions!`;
      case "error":
        return errorMessage || "Import failed. Please try again.";
      default:
        return "Ready to import";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "success":
        return "$green10";
      case "error":
        return "$red10";
      default:
        return "$color";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "uploading":
      case "analyzing":
      case "importing":
        return <Spinner size="small" color="$accentColor" />;
      case "success":
        return <Check size={24} color="green" />;
      case "error":
        return <AlertCircle size={24} color="red" />;
      default:
        return <FileSpreadsheet size={24} color="gray" />;
    }
  };

  const showProgress = status === "uploading" || status === "importing";

  return (
    <AnimatedView entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
      <GlassyCard>
        <YStack space="$4">
          {/* Status Icon and Message */}
          <View style={styles.row}>
            {getIcon()}
            <View style={styles.flex}>
              <Text color={getStatusColor()} fontSize={15} fontWeight="600">
                {getStatusMessage()}
              </Text>
              {status === "importing" && rowsTotal > 0 && (
                <Text color="$secondaryText" fontSize={13}>
                  Processing your transactions...
                </Text>
              )}
            </View>
          </View>

          {/* Progress Bar */}
          {showProgress && (
            <YStack space="$2">
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text color="$secondaryText" fontSize={12} textAlign="right">
                {Math.round(progress)}%
              </Text>
            </YStack>
          )}

          {/* Success Stats */}
          {status === "success" && (
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text color="green" fontSize={24} fontWeight="bold">
                  {rowsImported}
                </Text>
                <Text color="$secondaryText" fontSize={12}>
                  Imported
                </Text>
              </View>
              {rowsFailed > 0 && (
                <View style={styles.statItem}>
                  <Text color="orange" fontSize={24} fontWeight="bold">
                    {rowsFailed}
                  </Text>
                  <Text color="$secondaryText" fontSize={12}>
                    Skipped
                  </Text>
                </View>
              )}
            </View>
          )}
        </YStack>
      </GlassyCard>
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
  },
  statItem: {
    alignItems: "center",
  },
});

export default ImportProgress;
