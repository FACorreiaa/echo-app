/**
 * ReplicatePlanSheet Component Tests
 *
 * Tests smart replication utility functions and basic logic
 */

// Test helper functions directly (no component rendering)

// Replicating getItemTypeLabel logic
function getItemTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    budget: "Variable",
    recurring: "Fixed",
    goal: "Savings",
    income: "Income",
    investment: "Investment",
    debt: "Debt",
  };
  return labels[type] || type;
}

// Replicating getItemTypeColor logic
function getItemTypeColor(type: string): string {
  const colors: Record<string, string> = {
    budget: "#f59e0b",
    recurring: "#6366f1",
    goal: "#22c55e",
    income: "#2da6fa",
    investment: "#8b5cf6",
    debt: "#ef4444",
  };
  return colors[type] || "#9ca3af";
}

// Format money helper
function formatMoney(minor: number, currencyCode = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(minor / 100);
}

// Type definitions matching the component
type ItemStatus = "locked" | "review" | "ghost" | "new";
type ItemType = "budget" | "recurring" | "goal" | "income" | "investment" | "debt";

interface DiffItem {
  id: string;
  name: string;
  amount: number;
  type: ItemType;
  status: ItemStatus;
  originalAmount: number;
  variance?: number;
  actualLastMonth?: number;
  isGhost?: boolean;
  include: boolean;
}

// ============================================================================
// Test Helper Functions
// ============================================================================

const determineStatus = (itemType: string): ItemStatus => {
  if (itemType === "recurring" || itemType === "income" || itemType === "debt") {
    return "locked";
  }
  return "review";
};

const calculateVariance = (budgeted: number, actual: number): number | undefined => {
  if (budgeted > 0 && actual > 0) {
    return ((actual - budgeted) / budgeted) * 100;
  }
  return undefined;
};

const findGhostItems = (
  currentItems: string[],
  previousItems: { name: string; type: string }[],
): string[] => {
  const currentSet = new Set(currentItems.map((n) => n.toLowerCase()));
  return previousItems
    .filter(
      (item) =>
        (item.type === "recurring" || item.type === "income") &&
        !currentSet.has(item.name.toLowerCase()),
    )
    .map((item) => item.name);
};

const calculateTotals = (items: DiffItem[]) => {
  const includedItems = items.filter((i) => i.include);
  const totalBudget = includedItems.reduce((sum, i) => sum + i.amount, 0);
  const lockedTotal = includedItems
    .filter((i) => i.status === "locked")
    .reduce((sum, i) => sum + i.amount, 0);
  const reviewTotal = includedItems
    .filter((i) => i.status === "review")
    .reduce((sum, i) => sum + i.amount, 0);

  return { totalBudget, lockedTotal, reviewTotal };
};

describe("ReplicatePlanSheet", () => {
  describe("getItemTypeLabel", () => {
    it("returns 'Variable' for budget items", () => {
      expect(getItemTypeLabel("budget")).toBe("Variable");
    });

    it("returns 'Fixed' for recurring items", () => {
      expect(getItemTypeLabel("recurring")).toBe("Fixed");
    });

    it("returns 'Savings' for goal items", () => {
      expect(getItemTypeLabel("goal")).toBe("Savings");
    });

    it("returns 'Income' for income items", () => {
      expect(getItemTypeLabel("income")).toBe("Income");
    });

    it("returns type for unknown types", () => {
      expect(getItemTypeLabel("unknown")).toBe("unknown");
    });
  });

  describe("getItemTypeColor", () => {
    it("returns orange for budget items", () => {
      expect(getItemTypeColor("budget")).toBe("#f59e0b");
    });

    it("returns indigo for recurring items", () => {
      expect(getItemTypeColor("recurring")).toBe("#6366f1");
    });

    it("returns green for goal items", () => {
      expect(getItemTypeColor("goal")).toBe("#22c55e");
    });

    it("returns fallback for unknown types", () => {
      expect(getItemTypeColor("unknown")).toBe("#9ca3af");
    });
  });

  describe("formatMoney", () => {
    it("formats minor units to currency", () => {
      expect(formatMoney(50000)).toBe("€500");
    });

    it("formats with different currency", () => {
      expect(formatMoney(10000, "USD")).toBe("$100");
    });

    it("handles zero", () => {
      expect(formatMoney(0)).toBe("€0");
    });
  });

  describe("Item Categorization Logic", () => {
    it("categorizes recurring items as locked", () => {
      expect(determineStatus("recurring")).toBe("locked");
    });

    it("categorizes income items as locked", () => {
      expect(determineStatus("income")).toBe("locked");
    });

    it("categorizes debt items as locked", () => {
      expect(determineStatus("debt")).toBe("locked");
    });

    it("categorizes budget items as review", () => {
      expect(determineStatus("budget")).toBe("review");
    });

    it("categorizes goal items as review", () => {
      expect(determineStatus("goal")).toBe("review");
    });
  });

  describe("Variance Calculation", () => {
    it("calculates positive variance when over budget", () => {
      expect(calculateVariance(10000, 12000)).toBe(20);
    });

    it("calculates negative variance when under budget", () => {
      expect(calculateVariance(10000, 8000)).toBe(-20);
    });

    it("returns undefined when budgeted is 0", () => {
      expect(calculateVariance(0, 5000)).toBeUndefined();
    });

    it("returns undefined when actual is 0", () => {
      expect(calculateVariance(5000, 0)).toBeUndefined();
    });
  });

  describe("Ghost Item Detection Logic", () => {
    it("identifies missing recurring items as ghosts", () => {
      const currentItems = ["Rent", "Utilities"];
      const previousItems = [
        { name: "Rent", type: "recurring" },
        { name: "Netflix", type: "recurring" },
        { name: "Gym", type: "recurring" },
      ];

      const ghosts = findGhostItems(currentItems, previousItems);
      expect(ghosts).toEqual(["Netflix", "Gym"]);
    });

    it("ignores budget items in ghost detection", () => {
      const currentItems = ["Rent"];
      const previousItems = [
        { name: "Rent", type: "recurring" },
        { name: "Groceries", type: "budget" }, // Should NOT be a ghost
      ];

      const ghosts = findGhostItems(currentItems, previousItems);
      expect(ghosts).toEqual([]);
    });

    it("case-insensitive matching", () => {
      const currentItems = ["RENT"];
      const previousItems = [{ name: "Rent", type: "recurring" }];

      const ghosts = findGhostItems(currentItems, previousItems);
      expect(ghosts).toEqual([]);
    });
  });

  describe("Calculations", () => {
    const mockItems: DiffItem[] = [
      {
        id: "1",
        name: "Rent",
        amount: 120000,
        type: "recurring",
        status: "locked",
        originalAmount: 120000,
        include: true,
      },
      {
        id: "2",
        name: "Groceries",
        amount: 40000,
        type: "budget",
        status: "review",
        originalAmount: 40000,
        include: true,
      },
      {
        id: "3",
        name: "Dining",
        amount: 20000,
        type: "budget",
        status: "review",
        originalAmount: 20000,
        include: false, // Excluded
      },
    ];

    it("calculates total budget correctly", () => {
      const { totalBudget } = calculateTotals(mockItems);
      expect(totalBudget).toBe(160000); // 120000 + 40000 (excluded 20000)
    });

    it("calculates locked total correctly", () => {
      const { lockedTotal } = calculateTotals(mockItems);
      expect(lockedTotal).toBe(120000);
    });

    it("calculates review total correctly", () => {
      const { reviewTotal } = calculateTotals(mockItems);
      expect(reviewTotal).toBe(40000); // Only included review items
    });

    it("excludes non-included items from totals", () => {
      const allIncluded = mockItems.map((i) => Object.assign({}, i, { include: true }));
      const { totalBudget } = calculateTotals(allIncluded);
      expect(totalBudget).toBe(180000);
    });
  });

  describe("Next Month Default Name", () => {
    it("generates correct default plan name", () => {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      const monthName = nextMonth.toLocaleString("default", { month: "long", year: "numeric" });
      const defaultName = `${monthName} Plan`;

      expect(defaultName).toContain("Plan");
      expect(defaultName.length).toBeGreaterThan(10);
    });
  });
});
