/**
 * Plan components barrel export
 */

// Core plan components
export { CategoryGroupBuilder } from "./CategoryGroupBuilder";
export type { BuilderCategory, BuilderGroup, BuilderItem, ItemType } from "./CategoryGroupBuilder";
export { CategoryGroupCard } from "./CategoryGroupCard";
export { CreatePlanSheet } from "./CreatePlanSheet";
export { EditBudgetSheet } from "./EditBudgetSheet";
export { EditRecurringSheet } from "./EditRecurringSheet";
export { PlanCard } from "./PlanCard";

// Dashboard components
export { CATEGORY_COLORS, CategorySpendingChart } from "./CategorySpendingChart";
export type { CategorySpendingData } from "./CategorySpendingChart";

export { CategoryDetailCard } from "./CategoryDetailCard";
export type { BudgetItem, CategoryDetailData } from "./CategoryDetailCard";

export { PlanDashboard } from "./PlanDashboard";

// Grid components
export { GridCell } from "./GridCell";
export type { CellType, GridCellData, ThresholdStatus } from "./GridCell";

export { MonthlyGridView, generateMonths } from "./MonthlyGridView";
export type { MonthlyRowData, MonthlyValue } from "./MonthlyGridView";

// Goal tracking
export { GoalActualProgress, calculatePillarsFromGroups } from "./GoalActualProgress";
export type { BudgetPillar } from "./GoalActualProgress";
