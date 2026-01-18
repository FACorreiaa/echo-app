/**
 * Category Configuration for Echo OS
 * Defines visual styling and metadata for transaction categories
 */

export interface CategoryConfig {
  id: string;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  glowColor: string;
}

export const CATEGORY_COLORS: Record<string, CategoryConfig> = {
  groceries: {
    id: "groceries",
    label: "GROCERIES",
    icon: "🥬",
    color: "#22c55e",
    bgColor: "rgba(34, 197, 94, 0.15)",
    glowColor: "rgba(34, 197, 94, 0.3)",
  },
  entertainment: {
    id: "entertainment",
    label: "ENTERTAINMENT",
    icon: "🎬",
    color: "#ef4444",
    bgColor: "rgba(239, 68, 68, 0.15)",
    glowColor: "rgba(239, 68, 68, 0.3)",
  },
  subscriptions: {
    id: "subscriptions",
    label: "SUBSCRIPTIONS",
    icon: "💳",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.15)",
    glowColor: "rgba(59, 130, 246, 0.3)",
  },
  transportation: {
    id: "transportation",
    label: "TRANSPORTATION",
    icon: "🚗",
    color: "#eab308",
    bgColor: "rgba(234, 179, 8, 0.15)",
    glowColor: "rgba(234, 179, 8, 0.3)",
  },
  restaurants: {
    id: "restaurants",
    label: "RESTAURANTS",
    icon: "🍽️",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.15)",
    glowColor: "rgba(245, 158, 11, 0.3)",
  },
  coffee: {
    id: "coffee",
    label: "COFFEE",
    icon: "☕",
    color: "#92400e",
    bgColor: "rgba(146, 64, 14, 0.15)",
    glowColor: "rgba(146, 64, 14, 0.3)",
  },
  shops: {
    id: "shops",
    label: "SHOPS",
    icon: "🛍️",
    color: "#ec4899",
    bgColor: "rgba(236, 72, 153, 0.15)",
    glowColor: "rgba(236, 72, 153, 0.3)",
  },
  car: {
    id: "car",
    label: "CAR",
    icon: "🚘",
    color: "#6366f1",
    bgColor: "rgba(99, 102, 241, 0.15)",
    glowColor: "rgba(99, 102, 241, 0.3)",
  },
  health: {
    id: "health",
    label: "HEALTH",
    icon: "💪",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    glowColor: "rgba(16, 185, 129, 0.3)",
  },
  utilities: {
    id: "utilities",
    label: "UTILITIES",
    icon: "⚡",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.15)",
    glowColor: "rgba(245, 158, 11, 0.3)",
  },
  rent: {
    id: "rent",
    label: "RENT",
    icon: "🏠",
    color: "#8b5cf6",
    bgColor: "rgba(139, 92, 246, 0.15)",
    glowColor: "rgba(139, 92, 246, 0.3)",
  },
  income: {
    id: "income",
    label: "INCOME",
    icon: "💰",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.15)",
    glowColor: "rgba(16, 185, 129, 0.3)",
  },
  savings: {
    id: "savings",
    label: "SAVINGS",
    icon: "💎",
    color: "#2DA6FA",
    bgColor: "rgba(45, 166, 250, 0.15)",
    glowColor: "rgba(45, 166, 250, 0.3)",
  },
  "date-night": {
    id: "date-night",
    label: "DATE NIGHT",
    icon: "💜",
    color: "#d946ef",
    bgColor: "rgba(217, 70, 239, 0.15)",
    glowColor: "rgba(217, 70, 239, 0.3)",
  },
  other: {
    id: "other",
    label: "OTHER",
    icon: "📦",
    color: "#64748b",
    bgColor: "rgba(100, 116, 139, 0.15)",
    glowColor: "rgba(100, 116, 139, 0.3)",
  },
};

/**
 * Get category config by ID or slug
 * Returns default "other" config if not found
 */
export function getCategoryConfig(categoryId: string | undefined): CategoryConfig {
  if (!categoryId) return CATEGORY_COLORS.other;

  // Normalize the category ID
  const normalized = categoryId.toLowerCase().replace(/[_\s]/g, "-");

  return CATEGORY_COLORS[normalized] || CATEGORY_COLORS.other;
}

/**
 * Get all category configs as an array
 */
export function getAllCategories(): CategoryConfig[] {
  return Object.values(CATEGORY_COLORS);
}
