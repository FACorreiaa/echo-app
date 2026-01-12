/**
 * Plan Templates for Echo Wizard
 */

export interface TemplateItem {
  name: string;
  type: "budget" | "recurring" | "goal" | "income";
}

export interface TemplateCategory {
  name: string;
  icon?: string;
  items?: TemplateItem[];
}

export interface TemplateGroup {
  name: string;
  color: string;
  targetPercent: number;
  description: string;
  categories: TemplateCategory[];
}

export interface PlanTemplate {
  id: string;
  name: string;
  description: string;
  badge?: string; // e.g. "Popular", "Advanced"
  icon: string; // Emoji
  groups: TemplateGroup[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: "standard",
    name: "Standard (50/30/20)",
    description: "The classic Nischa-style framework. Best for getting started.",
    badge: "Recommended",
    icon: "🌱",
    groups: [
      {
        name: "Necessities",
        color: "#22c55e", // Green
        targetPercent: 50,
        description: "Essential survival costs (Housing, Food, Utilities)",
        categories: [
          {
            name: "Housing",
            icon: "home",
            items: [
              { name: "Rent / Mortgage", type: "recurring" },
              { name: "Property Tax", type: "recurring" },
            ],
          },
          {
            name: "Utilities",
            icon: "zap",
            items: [
              { name: "Electricity", type: "recurring" },
              { name: "Water", type: "recurring" },
              { name: "Internet", type: "recurring" },
            ],
          },
          {
            name: "Groceries",
            icon: "shopping-cart",
            items: [
              { name: "Supermarket", type: "budget" },
              { name: "Household Items", type: "budget" },
            ],
          },
          {
            name: "Transport",
            icon: "car",
            items: [
              { name: "Fuel", type: "budget" },
              { name: "Public Transport", type: "budget" },
              { name: "Car Insurance", type: "recurring" },
            ],
          },
          { name: "Insurance", icon: "shield" },
        ],
      },
      {
        name: "Wants",
        color: "#f59e0b", // Orange
        targetPercent: 30,
        description: "Fun & Lifestyle (Dining, Hobbies, Travel)",
        categories: [
          { name: "Dining Out", icon: "coffee" },
          { name: "Entertainment", icon: "film" },
          { name: "Shopping", icon: "shopping-bag" },
          { name: "Travel", icon: "plane" },
        ],
      },
      {
        name: "Future You",
        color: "#6366f1", // Indigo
        targetPercent: 20,
        description: "Savings & Debt Repayment",
        categories: [
          { name: "Emergency Fund", icon: "umbrella" },
          { name: "Investments", icon: "trending-up" },
          { name: "Debt Payoff", icon: "credit-card" },
        ],
      },
    ],
  },
  {
    id: "advanced",
    name: "Zero-Based Budget",
    description: "Give every euro a job. For granular control.",
    icon: "🎯",
    groups: [
      {
        name: "Fixed Expenses",
        color: "#ef4444", // Red
        targetPercent: 40,
        description: "Bills that must be paid",
        categories: [
          { name: "Rent/Mortgage", icon: "home" },
          { name: "Bills & Utilities", icon: "file-text" },
          { name: "Loan Payments", icon: "credit-card" },
        ],
      },
      {
        name: "Living Expenses",
        color: "#f59e0b", // Orange
        targetPercent: 30,
        description: "Variable daily costs",
        categories: [
          { name: "Groceries", icon: "shopping-cart" },
          { name: "Fuel/Transport", icon: "map-pin" },
          { name: "Personal Care", icon: "smile" },
        ],
      },
      {
        name: "Sinking Funds",
        color: "#3b82f6", // Blue
        targetPercent: 10,
        description: "Saving for known future costs",
        categories: [
          { name: "Car Maintenance", icon: "tool" },
          { name: "Gifts & Holidays", icon: "gift" },
          { name: "Medical", icon: "heart" },
        ],
      },
      {
        name: "Goals & Wealth",
        color: "#22c55e", // Green
        targetPercent: 20,
        description: "Long term growth",
        categories: [
          { name: "Retirement", icon: "sun" },
          { name: "Brokerage", icon: "bar-chart-2" },
        ],
      },
    ],
  },
  {
    id: "sovereign",
    name: "Sovereign (Wealth OS)",
    description: "Complex portfolio tracking for high net-worth individuals.",
    badge: "Elite",
    icon: "👑",
    groups: [
      {
        name: "Core Lifestyle",
        color: "#64748b", // Slate
        targetPercent: 40,
        description: "Base living costs",
        categories: [
          { name: "Residence", icon: "home" },
          { name: "Family & Staff", icon: "users" },
          { name: "Security", icon: "lock" },
        ],
      },
      {
        name: "Asset Maintenance",
        color: "#eab308", // Yellow
        targetPercent: 10,
        description: "Upkeep for properties/assets",
        categories: [
          { name: "Real Estate Taxes", icon: "file" },
          { name: "Maintenance", icon: "tool" },
        ],
      },
      {
        name: "Wealth Building",
        color: "#22c55e", // Green
        targetPercent: 50,
        description: "Aggressive accumulation",
        categories: [
          { name: "Private Equity", icon: "briefcase" },
          { name: "Crypto Assets", icon: "bitcoin" },
          { name: "Stocks", icon: "trending-up" },
          { name: "Venture", icon: "rocket" },
        ],
      },
    ],
  },
];
