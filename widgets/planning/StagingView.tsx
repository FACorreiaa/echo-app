import { ChevronDown, ChevronUp, Edit3, GripVertical, Trash2 } from "@tamagui/lucide-icons";
import { useState } from "react";
import { Pressable } from "react-native";
import { Button, ScrollView, Text, XStack, YStack } from "tamagui";

import { GlassyButton } from "@/components/ui/GlassyButton";
import { GlassyCard } from "@/components/ui/GlassyCard";

// ============================================================================
// Types matching Go backend AnalysisNode
// ============================================================================

export type NodeType = "GROUP" | "ITEM" | "IGNORE";
export type ItemTag = "B" | "R" | "S" | "IN" | "D" | "";

export interface AnalysisNode {
  id: string;
  name: string;
  value: number;
  type: NodeType;
  tag: ItemTag;
  confidence: number;
  excelCell: string;
  excelRow: number;
  formula?: string;
  children?: AnalysisNode[];
}

export interface AnalysisTreeResponse {
  sheetName: string;
  nodes: AnalysisNode[];
  totalGroups: number;
  totalItems: number;
  overallConfidence: number;
}

// ============================================================================
// Staging View Props
// ============================================================================

interface StagingViewProps {
  tree: AnalysisTreeResponse;
  onFinalize: (correctedTree: AnalysisTreeResponse) => void;
  onBack: () => void;
  onLearnCorrection?: (itemName: string, tag: ItemTag) => void;
}

interface StagingItemProps {
  node: AnalysisNode;
  isGroup: boolean;
  onPromote: (id: string) => void;
  onDemote: (id: string) => void;
  onDelete: (id: string) => void;
  onChangeTag: (id: string, tag: ItemTag) => void;
}

// Tag colors for displaying item classification badges
const TAG_COLORS: Record<ItemTag, string> = {
  B: "#3b82f6", // blue
  R: "#8b5cf6", // purple
  S: "#22c55e", // green
  IN: "#10b981", // emerald
  D: "#ef4444", // red
  "": "#6b7280", // gray
};

// ============================================================================
// Staging Item Component
// ============================================================================

const StagingItem = ({
  node,
  isGroup,
  onPromote,
  onDemote,
  onDelete,
  onChangeTag,
}: StagingItemProps) => {
  const [expanded, setExpanded] = useState(true);

  // Void usage to satisfy linter - onChangeTag is passed to children
  void onChangeTag;

  // Color-code based on ML confidence
  const borderColor =
    node.confidence < 0.7
      ? "#ef4444" // red - low confidence
      : node.confidence < 0.85
        ? "#f59e0b" // amber - medium confidence
        : "rgba(255, 255, 255, 0.15)"; // default

  const isLowConfidence = node.confidence < 0.7;

  return (
    <YStack marginVertical={4}>
      <GlassyCard padding={12} borderColor={borderColor} borderWidth={isLowConfidence ? 2 : 1}>
        <XStack alignItems="center" gap="$2">
          {/* Drag handle */}
          <GripVertical size={18} color="rgba(255,255,255,0.4)" />

          {/* Expand/collapse for groups */}
          {isGroup && node.children && node.children.length > 0 && (
            <Pressable onPress={() => setExpanded(!expanded)}>
              {expanded ? (
                <ChevronDown size={18} color="white" />
              ) : (
                <ChevronUp size={18} color="white" />
              )}
            </Pressable>
          )}

          {/* Node info */}
          <YStack flex={1}>
            <XStack alignItems="center" gap="$2">
              <Text fontWeight={isGroup ? "700" : "500"} color="white" fontSize={isGroup ? 16 : 14}>
                {node.name}
              </Text>
              {node.tag && (
                <XStack
                  backgroundColor={TAG_COLORS[node.tag] as `#${string}`}
                  paddingHorizontal={6}
                  paddingVertical={2}
                  borderRadius={4}
                >
                  <Text fontSize={10} color="white" fontWeight="700">
                    {node.tag}
                  </Text>
                </XStack>
              )}
            </XStack>
            <XStack gap="$2" alignItems="center">
              <Text fontSize={11} color="rgba(255,255,255,0.5)">
                {node.excelCell} • {isGroup ? "GROUP" : "ITEM"}
              </Text>
              {isLowConfidence && (
                <Text fontSize={10} color="#ef4444" fontWeight="700">
                  LOW CONFIDENCE
                </Text>
              )}
            </XStack>
          </YStack>

          {/* Value */}
          {!isGroup && node.value > 0 && (
            <Text color="white" fontWeight="600" fontSize={14}>
              €{node.value.toFixed(2)}
            </Text>
          )}

          {/* Actions */}
          <XStack gap="$1">
            {/* Promote/Demote */}
            {!isGroup && (
              <Button
                size="$2"
                circular
                chromeless
                icon={<ChevronUp size={16} />}
                onPress={() => onPromote(node.id)}
              />
            )}
            {isGroup && (
              <Button
                size="$2"
                circular
                chromeless
                icon={<ChevronDown size={16} />}
                onPress={() => onDemote(node.id)}
              />
            )}
            <Button
              size="$2"
              circular
              chromeless
              icon={<Trash2 size={16} color="#ef4444" />}
              onPress={() => onDelete(node.id)}
            />
          </XStack>
        </XStack>
      </GlassyCard>

      {/* Children (items) */}
      {isGroup && expanded && node.children && (
        <YStack marginLeft={24} marginTop={4}>
          {node.children.map((child) => (
            <StagingItem
              key={child.id}
              node={child}
              isGroup={false}
              onPromote={onPromote}
              onDemote={onDemote}
              onDelete={onDelete}
              onChangeTag={onChangeTag}
            />
          ))}
        </YStack>
      )}
    </YStack>
  );
};

// ============================================================================
// Staging View Component
// ============================================================================

export const StagingView = ({ tree, onFinalize, onBack, onLearnCorrection }: StagingViewProps) => {
  const [nodes, setNodes] = useState<AnalysisNode[]>(tree.nodes);

  // Promote ITEM to GROUP
  const handlePromote = (id: string) => {
    setNodes((prev) => {
      // Find the item and remove from its parent, make it a GROUP
      const newNodes = [...prev];
      for (const group of newNodes) {
        if (group.children) {
          const idx = group.children.findIndex((c) => c.id === id);
          if (idx !== -1) {
            const item = group.children[idx];
            group.children.splice(idx, 1);
            // Add as new group
            newNodes.push({
              ...item,
              type: "GROUP",
              children: [],
            });
            break;
          }
        }
      }
      return newNodes;
    });
  };

  // Demote GROUP to ITEM
  const handleDemote = (id: string) => {
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx === -1) return prev;

      const group = prev[idx];
      const newNodes = [...prev];
      newNodes.splice(idx, 1);

      // Add as item to previous group
      if (idx > 0 && newNodes[idx - 1]) {
        newNodes[idx - 1].children = [
          ...(newNodes[idx - 1].children || []),
          { ...group, type: "ITEM" },
          ...(group.children || []),
        ];
      }
      return newNodes;
    });
  };

  // Delete node
  const handleDelete = (id: string) => {
    setNodes((prev) => {
      // Check top-level groups
      const topIdx = prev.findIndex((n) => n.id === id);
      if (topIdx !== -1) {
        const newNodes = [...prev];
        newNodes.splice(topIdx, 1);
        return newNodes;
      }

      // Check children
      return prev.map((group) => ({
        ...group,
        children: group.children?.filter((c) => c.id !== id),
      }));
    });
  };

  // Change tag
  const handleChangeTag = (id: string, tag: ItemTag) => {
    setNodes((prev) =>
      prev.map((group) => {
        if (group.id === id) {
          return { ...group, tag };
        }
        return {
          ...group,
          children: group.children?.map((c) => (c.id === id ? { ...c, tag } : c)),
        };
      }),
    );

    // Trigger online learning
    const node = nodes.flatMap((g) => [g, ...(g.children || [])]).find((n) => n.id === id);
    if (node && onLearnCorrection) {
      onLearnCorrection(node.name, tag);
    }
  };

  // Calculate totals
  const totalGroups = nodes.length;
  const totalItems = nodes.reduce((sum, g) => sum + (g.children?.length || 0), 0);

  const handleFinalize = () => {
    onFinalize({
      ...tree,
      nodes,
      totalGroups,
      totalItems,
    });
  };

  return (
    <YStack flex={1}>
      {/* Header */}
      <YStack paddingHorizontal={16} paddingTop={16} paddingBottom={8}>
        <Text fontSize={20} fontWeight="700" color="white">
          Review Import
        </Text>
        <Text fontSize={14} color="rgba(255,255,255,0.7)" marginTop={4}>
          {totalGroups} groups • {totalItems} items • {tree.sheetName}
        </Text>
        {tree.overallConfidence < 0.8 && (
          <XStack
            backgroundColor="rgba(245, 158, 11, 0.15)"
            padding={12}
            borderRadius={8}
            marginTop={12}
            alignItems="center"
            gap={8}
          >
            <Edit3 size={16} color="#f59e0b" />
            <Text fontSize={12} color="#f59e0b" flex={1}>
              Some items have low confidence. Tap to review and correct.
            </Text>
          </XStack>
        )}
      </YStack>

      {/* Scrollable content */}
      <ScrollView
        flex={1}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {nodes.map((node) => (
          <StagingItem
            key={node.id}
            node={node}
            isGroup={true}
            onPromote={handlePromote}
            onDemote={handleDemote}
            onDelete={handleDelete}
            onChangeTag={handleChangeTag}
          />
        ))}
      </ScrollView>

      {/* Actions */}
      <XStack
        padding={16}
        gap={12}
        borderTopWidth={1}
        borderTopColor="rgba(255,255,255,0.1)"
        backgroundColor="rgba(0,0,0,0.3)"
      >
        <YStack flex={1}>
          <GlassyButton variant="outline" onPress={onBack}>
            <Text color="white" fontWeight="600">
              Back
            </Text>
          </GlassyButton>
        </YStack>
        <YStack flex={2}>
          <GlassyButton onPress={handleFinalize}>
            <Text color="white" fontWeight="700">
              Import {totalItems} Items
            </Text>
          </GlassyButton>
        </YStack>
      </XStack>
    </YStack>
  );
};

export default StagingView;
