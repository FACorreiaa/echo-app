/**
 * Plan components barrel export
 */

// Core plan components
export { ActivePlanHeader } from "./ActivePlanHeader";
export { BudgetCard } from "./BudgetCard";
export { CategoryGroupBuilder } from "./CategoryGroupBuilder";
export type { BuilderCategory, BuilderGroup, BuilderItem, ItemType } from "./CategoryGroupBuilder";
export { CategoryGroupCard } from "./CategoryGroupCard";
export { CreatePlanSheet } from "./CreatePlanSheet";
export { EditableItemRow } from "./EditableItemRow";
export { EditBudgetSheet } from "./EditBudgetSheet";
export { EditPlanSheet } from "./EditPlanSheet";
export { EditRecurringSheet } from "./EditRecurringSheet";
export { GoalCard } from "./GoalCard";
export { PlanCard } from "./PlanCard";
export { PlanProgressWidget } from "./PlanProgressWidget";
export { PlanWizardSheet } from "./PlanWizardSheet";
export { RecurringCard } from "./RecurringCard";

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

// Item type configuration
export { ItemTypesSheet } from "./ItemTypesSheet";

// Monthly budget versioning
export { MonthlyBudgetView } from "./MonthlyBudgetView";
