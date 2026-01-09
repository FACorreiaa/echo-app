/**
 * CategoryGroupBuilder - Interactive builder for creating budget category groups
 *
 * This component guides users through building their financial skeleton:
 * 1. Define top-level groups (Fundamentals, Fun, Future)
 * 2. Add categories to each group (Housing, Transport)
 * 3. Add line items with budgeted amounts (Rent: €1000, Electricity: €50)
 */

import {
  Check,
  ChevronDown,
  ChevronRight,
  Info as InfoIcon,
  Plus,
  Trash2,
} from "@tamagui/lucide-icons";
import React, { useState } from "react";
import { Alert, Pressable } from "react-native";
import { Button, H3, Input, Text, XStack, YStack } from "tamagui";

import { GlassyCard } from "@/components/ui/GlassyCard";
import {
  DEFAULT_ITEM_CONFIGS,
  useItemConfigs,
  type ItemConfig,
} from "@/lib/hooks/use-item-configs";
import { ItemTypesSheet } from "./ItemTypesSheet";

// Types for the builder
export type ItemType = "budget" | "recurring" | "goal" | "income";

export interface BuilderItem {
  id: string;
  name: string;
  budgetedMinor: number;
  itemType: ItemType;
  configId?: string; // Link to dynamic config
  initialActualMinor?: number; // For "Saved" amount in Goals
}

export interface BuilderCategory {
  id: string;
  name: string;
  icon?: string;
  items: BuilderItem[];
}

export interface BuilderGroup {
  id: string;
  name: string;
  color: string;
  targetPercent: number;
  categories: BuilderCategory[];
}

interface CategoryGroupBuilderProps {
  initialGroups?: BuilderGroup[];
  groups: BuilderGroup[];
  onChange: (groups: BuilderGroup[]) => void;
}

// Default colors for groups
const GROUP_COLORS = ["#22c55e", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6"];

// Item type badges
const ITEM_TYPE_CONFIG: Record<ItemType, { label: string; color: string }> = {
  budget: { label: "Budget", color: "#22c55e" },
  recurring: { label: "Recurring", color: "#f59e0b" },
  goal: { label: "Savings", color: "#6366f1" },
  income: { label: "Income", color: "#14b8a6" },
};

/**
 * Main CategoryGroupBuilder component
 */
export function CategoryGroupBuilder({
  groups,
  onChange,
  initialGroups,
}: CategoryGroupBuilderProps) {
  // Initialize from initialGroups if provided and groups are empty (first load)
  React.useEffect(() => {
    if (initialGroups && groups.length === 0) {
      onChange(initialGroups);
      setExpandedGroups(new Set(initialGroups.map((g) => g.id)));
    }
  }, [initialGroups]);

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(groups.map((g) => g.id)),
  );
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [newGroupName, setNewGroupName] = useState("");
  const [infoSheetOpen, setInfoSheetOpen] = useState(false);

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    const next = new Set(expandedGroups);
    if (next.has(groupId)) {
      next.delete(groupId);
    } else {
      next.add(groupId);
    }
    setExpandedGroups(next);
  };

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setExpandedCategories(next);
  };

  // Add a new top-level group
  const addGroup = () => {
    if (!newGroupName.trim()) {
      Alert.alert("Error", "Please enter a group name");
      return;
    }
    const newGroup: BuilderGroup = {
      id: `group_${Date.now()}`,
      name: newGroupName.trim(),
      color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
      targetPercent: 0,
      categories: [],
    };
    onChange([...groups, newGroup]);
    setNewGroupName("");
    setExpandedGroups((prev) => new Set(prev).add(newGroup.id));
  };

  // Delete a group
  const deleteGroup = (groupId: string) => {
    Alert.alert(
      "Delete Group",
      "Are you sure you want to delete this group and all its categories?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onChange(groups.filter((g) => g.id !== groupId)),
        },
      ],
    );
  };

  // Add a category to a group
  const addCategory = (groupId: string, categoryName: string) => {
    const newCategory: BuilderCategory = {
      id: `cat_${Date.now()}`,
      name: categoryName,
      items: [],
    };
    onChange(
      groups.map((g) =>
        g.id === groupId ? { ...g, categories: [...g.categories, newCategory] } : g,
      ),
    );
    setExpandedCategories((prev) => new Set(prev).add(newCategory.id));
  };

  // Delete a category
  const deleteCategory = (groupId: string, categoryId: string) => {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, categories: g.categories.filter((c) => c.id !== categoryId) }
          : g,
      ),
    );
  };

  // Add an item to a category
  const addItem = (groupId: string, categoryId: string, itemName: string, itemType: ItemType) => {
    const newItem: BuilderItem = {
      id: `item_${Date.now()}`,
      name: itemName,
      budgetedMinor: 0,
      itemType,
      configId:
        itemType === "budget"
          ? "1"
          : itemType === "recurring"
            ? "2"
            : itemType === "goal"
              ? "3"
              : itemType === "income"
                ? "4"
                : undefined,
    };
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              categories: g.categories.map((c) =>
                c.id === categoryId ? { ...c, items: [...c.items, newItem] } : c,
              ),
            }
          : g,
      ),
    );
  };

  // Update item actual (for goals)
  const updateItemActual = (
    groupId: string,
    categoryId: string,
    itemId: string,
    initialActualMinor: number,
  ) => {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              categories: g.categories.map((c) =>
                c.id === categoryId
                  ? {
                      ...c,
                      items: c.items.map((i) =>
                        i.id === itemId ? { ...i, initialActualMinor } : i,
                      ),
                    }
                  : c,
              ),
            }
          : g,
      ),
    );
  };

  // Update item budget
  const updateItemBudget = (
    groupId: string,
    categoryId: string,
    itemId: string,
    budgetedMinor: number,
  ) => {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              categories: g.categories.map((c) =>
                c.id === categoryId
                  ? {
                      ...c,
                      items: c.items.map((i) => (i.id === itemId ? { ...i, budgetedMinor } : i)),
                    }
                  : c,
              ),
            }
          : g,
      ),
    );
  };

  // Delete an item
  const deleteItem = (groupId: string, categoryId: string, itemId: string) => {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              categories: g.categories.map((c) =>
                c.id === categoryId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c,
              ),
            }
          : g,
      ),
    );
  };

  return (
    <YStack gap="$3">
      {/* Header with Help */}
      <XStack justifyContent="space-between" alignItems="center" paddingHorizontal="$1">
        <Text color="$secondaryText" fontSize={12}>
          Draft your plan structure
        </Text>
        <Button
          size="$2"
          chromeless
          onPress={() => setInfoSheetOpen(true)}
          pressStyle={{ opacity: 0.7 }}
          paddingHorizontal="$2"
        >
          <XStack alignItems="center" gap="$2">
            {/* Icon */}
            <InfoIcon size={14} color="$accentColor" />
            <Text color="$accentColor" fontSize={12} fontWeight="600">
              Item Types Key
            </Text>
          </XStack>
        </Button>
      </XStack>

      <ItemTypesSheet open={infoSheetOpen} onOpenChange={setInfoSheetOpen} />

      {/* Add new group */}
      <GlassyCard>
        <XStack padding="$3" gap="$2" alignItems="center">
          <Input
            flex={1}
            placeholder="Add a group (e.g., Fundamentals, Fun)"
            value={newGroupName}
            onChangeText={setNewGroupName}
            onSubmitEditing={addGroup}
            backgroundColor="transparent"
            borderWidth={0}
          />
          <Button
            size="$3"
            backgroundColor="$accentGradientStart"
            onPress={addGroup}
            disabled={!newGroupName.trim()}
          >
            <Plus size={18} color="white" />
          </Button>
        </XStack>
      </GlassyCard>

      {/* Groups list */}
      {groups.map((group) => (
        <GroupCard
          key={group.id}
          group={group}
          isExpanded={expandedGroups.has(group.id)}
          expandedCategories={expandedCategories}
          onToggle={() => toggleGroup(group.id)}
          onToggleCategory={toggleCategory}
          onDelete={() => deleteGroup(group.id)}
          onAddCategory={(name) => addCategory(group.id, name)}
          onDeleteCategory={(catId) => deleteCategory(group.id, catId)}
          onAddItem={(catId, name, type) => addItem(group.id, catId, name, type)}
          onUpdateItemBudget={(catId, itemId, amount) =>
            updateItemBudget(group.id, catId, itemId, amount)
          }
          onUpdateItemActual={(catId, itemId, amount) =>
            updateItemActual(group.id, catId, itemId, amount)
          }
          onDeleteItem={(catId, itemId) => deleteItem(group.id, catId, itemId)}
        />
      ))}

      {/* Empty state */}
      {groups.length === 0 && (
        <YStack alignItems="center" padding="$6" gap="$2">
          <Text color="$secondaryText" fontSize="$5">
            No groups yet
          </Text>
          <Text color="$secondaryText" fontSize="$3" textAlign="center">
            Add groups like "Fundamentals", "Fun", or "Savings" to organize your budget
          </Text>
        </YStack>
      )}
    </YStack>
  );
}

// ============================================================================
// GroupCard Component
// ============================================================================

interface GroupCardProps {
  group: BuilderGroup;
  isExpanded: boolean;
  expandedCategories: Set<string>;
  onToggle: () => void;
  onToggleCategory: (categoryId: string) => void;
  onDelete: () => void;
  onAddCategory: (name: string) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddItem: (categoryId: string, name: string, itemType: ItemType) => void;
  onUpdateItemBudget: (categoryId: string, itemId: string, amount: number) => void;
  onUpdateItemActual: (categoryId: string, itemId: string, amount: number) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
}

function GroupCard({
  group,
  isExpanded,
  expandedCategories,
  onToggle,
  onToggleCategory,
  onDelete,
  onAddCategory,
  onDeleteCategory,
  onAddItem,
  onUpdateItemBudget,
  onUpdateItemActual,
  onDeleteItem,
}: GroupCardProps) {
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName("");
    }
  };

  const totalBudget = group.categories.reduce(
    (sum, cat) => sum + cat.items.reduce((s, i) => s + i.budgetedMinor, 0),
    0,
  );

  return (
    <GlassyCard>
      <YStack>
        {/* Group header */}
        <Pressable onPress={onToggle}>
          <XStack
            padding="$3"
            alignItems="center"
            justifyContent="space-between"
            borderBottomWidth={isExpanded ? 1 : 0}
            borderColor="$borderColor"
          >
            <XStack alignItems="center" gap="$2" flex={1}>
              {isExpanded ? (
                <ChevronDown size={20} color="$secondaryText" />
              ) : (
                <ChevronRight size={20} color="$secondaryText" />
              )}
              <YStack
                width={12}
                height={12}
                borderRadius={6}
                backgroundColor={group.color as any}
              />
              <H3 color="$color" fontSize="$5">
                {group.name}
              </H3>
            </XStack>
            <XStack alignItems="center" gap="$3">
              <Text color="$secondaryText" fontSize="$3">
                €{(totalBudget / 100).toFixed(0)}
              </Text>
              <Pressable onPress={onDelete}>
                <Trash2 size={18} color="$red10" />
              </Pressable>
            </XStack>
          </XStack>
        </Pressable>

        {/* Expanded content */}
        {isExpanded && (
          <YStack padding="$3" gap="$3">
            {/* Add category input */}
            <XStack gap="$2" alignItems="center">
              <Input
                flex={1}
                size="$3"
                placeholder="Add category (e.g., Housing, Transport)"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                onSubmitEditing={handleAddCategory}
                backgroundColor="rgba(255,255,255,0.05)"
              />
              <Button size="$3" onPress={handleAddCategory} disabled={!newCategoryName.trim()}>
                <Plus size={16} color="white" />
              </Button>
            </XStack>

            {/* Categories */}
            {group.categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                isExpanded={expandedCategories.has(category.id)}
                onToggle={() => onToggleCategory(category.id)}
                onDelete={() => onDeleteCategory(category.id)}
                onAddItem={(name, type) => onAddItem(category.id, name, type)}
                onUpdateItemBudget={(itemId, amount) =>
                  onUpdateItemBudget(category.id, itemId, amount)
                }
                onUpdateItemActual={(itemId, amount) =>
                  onUpdateItemActual(category.id, itemId, amount)
                }
                onDeleteItem={(itemId) => onDeleteItem(category.id, itemId)}
              />
            ))}

            {group.categories.length === 0 && (
              <Text color="$secondaryText" fontSize="$2" textAlign="center" paddingVertical="$2">
                Add categories like "Housing", "Transport", or "Subscriptions"
              </Text>
            )}
          </YStack>
        )}
      </YStack>
    </GlassyCard>
  );
}

// ============================================================================
// CategoryCard Component
// ============================================================================

interface CategoryCardProps {
  category: BuilderCategory;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onAddItem: (name: string, itemType: ItemType) => void;
  onUpdateItemBudget: (itemId: string, amount: number) => void;
  onUpdateItemActual: (itemId: string, amount: number) => void;
  onDeleteItem: (itemId: string) => void;
}

function CategoryCard({
  category,
  isExpanded,
  onToggle,
  onDelete,
  onAddItem,
  onUpdateItemBudget,
  onUpdateItemActual,
  onDeleteItem,
}: CategoryCardProps) {
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<ItemType>("budget");

  const handleAddItem = () => {
    if (newItemName.trim()) {
      onAddItem(newItemName.trim(), newItemType);
      setNewItemName("");
    }
  };

  const totalBudget = category.items.reduce((sum, i) => sum + i.budgetedMinor, 0);

  return (
    <YStack
      backgroundColor="rgba(255,255,255,0.03)"
      borderRadius="$3"
      borderWidth={1}
      borderColor="$borderColor"
    >
      {/* Category header */}
      <Pressable onPress={onToggle}>
        <XStack
          padding="$2"
          paddingHorizontal="$3"
          alignItems="center"
          justifyContent="space-between"
        >
          <XStack alignItems="center" gap="$2" flex={1}>
            {isExpanded ? (
              <ChevronDown size={16} color="$secondaryText" />
            ) : (
              <ChevronRight size={16} color="$secondaryText" />
            )}
            <Text color="$color" fontWeight="600">
              {category.name}
            </Text>
            <Text color="$secondaryText" fontSize="$2">
              ({category.items.length} items)
            </Text>
          </XStack>
          <XStack alignItems="center" gap="$2">
            <Text color="$color" fontSize="$3">
              €{(totalBudget / 100).toFixed(0)}
            </Text>
            <Pressable onPress={onDelete}>
              <Trash2 size={14} color="$red10" />
            </Pressable>
          </XStack>
        </XStack>
      </Pressable>

      {/* Expanded items */}
      {isExpanded && (
        <YStack padding="$2" paddingTop={0} gap="$2">
          {/* Items list */}
          {category.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              onUpdateBudget={(amount) => onUpdateItemBudget(item.id, amount)}
              onUpdateActual={(amount) => onUpdateItemActual(item.id, amount)}
              onDelete={() => onDeleteItem(item.id)}
            />
          ))}

          {/* Add item input */}
          <XStack gap="$2" alignItems="center" paddingTop="$1">
            <Input
              flex={1}
              size="$2"
              placeholder="Add item (e.g., Rent, Netflix)"
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAddItem}
              backgroundColor="rgba(255,255,255,0.05)"
            />
            <ItemTypeSelector value={newItemType} onChange={setNewItemType} />
            <Button size="$2" onPress={handleAddItem} disabled={!newItemName.trim()}>
              <Check size={14} color="white" />
            </Button>
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}

// ============================================================================
// ItemRow Component
// ============================================================================

interface ItemRowProps {
  item: BuilderItem;
  onUpdateBudget: (amount: number) => void;
  onUpdateActual: (amount: number) => void;
  onDelete: () => void;
}

function ItemRow({ item, onUpdateBudget, onUpdateActual, onDelete }: ItemRowProps) {
  const [budgetInputValue, setBudgetInputValue] = useState(
    item.budgetedMinor > 0 ? (item.budgetedMinor / 100).toString() : "",
  );

  const [actualInputValue, setActualInputValue] = useState(
    item.initialActualMinor && item.initialActualMinor > 0
      ? (item.initialActualMinor / 100).toString()
      : "",
  );

  const handleBudgetBlur = () => {
    const amount = parseFloat(budgetInputValue.replace(",", ".")) || 0;
    onUpdateBudget(Math.round(amount * 100));
  };

  const handleActualBlur = () => {
    const amount = parseFloat(actualInputValue.replace(",", ".")) || 0;
    onUpdateActual(Math.round(amount * 100));
  };

  const typeConfig = ITEM_TYPE_CONFIG[item.itemType];
  const isGoal = item.itemType === "goal";

  return (
    <XStack
      alignItems="center"
      gap="$2"
      backgroundColor="rgba(255,255,255,0.02)"
      padding="$2"
      borderRadius="$2"
    >
      <Text color="$color" flex={1} fontSize="$3">
        {item.name}
      </Text>
      <YStack
        backgroundColor={typeConfig.color as any}
        paddingHorizontal="$2"
        paddingVertical="$1"
        borderRadius="$1"
      >
        <Text color="white" fontSize={10} fontWeight="600">
          {typeConfig.label}
        </Text>
      </YStack>

      {/* Inputs */}
      <XStack alignItems="center" gap="$2">
        {/* For goals, show Target label */}
        {isGoal && (
          <Text color="$secondaryText" fontSize={10}>
            Target:
          </Text>
        )}

        <XStack alignItems="center" gap="$1">
          <Text color="$secondaryText">€</Text>
          <Input
            size="$2"
            width={70}
            keyboardType="decimal-pad"
            value={budgetInputValue}
            onChangeText={setBudgetInputValue}
            onBlur={handleBudgetBlur}
            textAlign="right"
            backgroundColor="rgba(255,255,255,0.05)"
            placeholder={isGoal ? "Target" : "Limit"}
          />
        </XStack>

        {/* Goal only: Current Saved */}
        {isGoal && (
          <XStack alignItems="center" gap="$1" paddingLeft="$2">
            <Text color="$secondaryText" fontSize={10}>
              Saved:
            </Text>
            <Text color="$secondaryText">€</Text>
            <Input
              size="$2"
              width={70}
              keyboardType="decimal-pad"
              value={actualInputValue}
              onChangeText={setActualInputValue}
              onBlur={handleActualBlur}
              textAlign="right"
              backgroundColor="rgba(255,255,255,0.05)"
              placeholder="0"
            />
          </XStack>
        )}
      </XStack>

      <Pressable onPress={onDelete}>
        <Trash2 size={14} color="$red10" />
      </Pressable>
    </XStack>
  );
}

// ============================================================================
// ItemTypeSelector Component
// ============================================================================

interface ItemTypeSelectorProps {
  value: ItemType;
  onChange: (type: ItemType) => void;
}

function ItemTypeSelector({ value, onChange }: ItemTypeSelectorProps) {
  const { data: configs = DEFAULT_ITEM_CONFIGS } = useItemConfigs();

  // Filter to show only expense types by default (outflow behavior)
  const expenseConfigs = configs.filter(
    (c) => c.behavior === "outflow" && ["budgets", "recurring", "goals"].includes(c.targetTab),
  );

  return (
    <XStack>
      {expenseConfigs.map((config) => {
        const isSelected = value === mapConfigToItemType(config);
        return (
          <Pressable key={config.id} onPress={() => onChange(mapConfigToItemType(config))}>
            <YStack
              backgroundColor={isSelected ? (config.colorHex as any) : "transparent"}
              borderWidth={1}
              borderColor={config.colorHex as any}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$1"
              marginRight="$1"
            >
              <Text
                color={isSelected ? "white" : (config.colorHex as any)}
                fontSize={10}
                fontWeight="600"
              >
                {config.shortCode.slice(0, 1)}
              </Text>
            </YStack>
          </Pressable>
        );
      })}
    </XStack>
  );
}

// Helper to map config to legacy ItemType
function mapConfigToItemType(config: ItemConfig): ItemType {
  switch (config.targetTab) {
    case "budgets":
      return "budget";
    case "recurring":
      return "recurring";
    case "goals":
      return "goal";
    case "income":
      return "income";
    default:
      return "budget";
  }
}

export default CategoryGroupBuilder;
