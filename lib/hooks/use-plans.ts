/**
 * usePlans - React Query hooks for user financial plans
 */

import { planClient } from "@/lib/api/client";
import type { PlanStatus as ProtoPlanStatus } from "@buf/echo-tracker_echo.bufbuild_es/echo/v1/plan_pb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// Types
// ============================================================================

export interface Money {
  amountMinor: bigint;
  currencyCode: string;
}

export interface PlanItem {
  id: string;
  name: string;
  budgeted: number; // Major units (euros/dollars)
  actual: number;
  excelCell?: string;
  formula?: string;
  widgetType: "input" | "slider" | "toggle" | "readonly";
  fieldType: "currency" | "percentage" | "number" | "text";
  labels: Record<string, string>;
}

export interface PlanCategory {
  id: string;
  name: string;
  icon?: string;
  items: PlanItem[];
  labels: Record<string, string>;
}

export interface PlanCategoryGroup {
  id: string;
  name: string;
  color?: string;
  targetPercent: number;
  categories: PlanCategory[];
  labels: Record<string, string>;
}

export type PlanStatus = "draft" | "active" | "archived";
export type PlanSourceType = "manual" | "excel" | "template";

export interface UserPlan {
  id: string;
  name: string;
  description?: string;
  status: PlanStatus;
  sourceType: PlanSourceType;
  totalIncome: number; // Major units
  totalExpenses: number; // Major units
  surplus: number; // Major units
  currencyCode: string;
  categoryGroups: PlanCategoryGroup[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Convert minor units to major units (cents to dollars/euros)
 */
function toMajor(minor?: bigint): number {
  return Number(minor ?? BigInt(0)) / 100;
}

/**
 * Map proto status to local status
 */
function mapStatus(protoStatus: number): PlanStatus {
  switch (protoStatus) {
    case 1:
      return "draft";
    case 2:
      return "active";
    case 3:
      return "archived";
    default:
      return "draft";
  }
}

/**
 * Map proto source type to local type
 */
function mapSourceType(protoSource: number): PlanSourceType {
  switch (protoSource) {
    case 1:
      return "manual";
    case 2:
      return "excel";
    case 3:
      return "template";
    default:
      return "manual";
  }
}

/**
 * Get localized label with fallback
 */
export function getLabel(labels: Record<string, string>, lang = "en"): string {
  return labels[lang] || labels["en"] || Object.values(labels)[0] || "";
}

/**
 * Format currency for display
 */
export function formatMoney(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all plans for current user
 */
export function usePlans(statusFilter?: PlanStatus) {
  return useQuery({
    queryKey: ["plans", statusFilter],
    queryFn: async (): Promise<UserPlan[]> => {
      const response = await planClient.listPlans({
        statusFilter: statusFilter ? mapStatusToProto(statusFilter) : undefined,
        limit: 50,
        offset: 0,
      });

      return (response.plans ?? []).map(mapPlanFromProto);
    },
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Fetch a single plan with full details
 */
export function usePlan(planId: string) {
  return useQuery({
    queryKey: ["plan", planId],
    queryFn: async (): Promise<UserPlan | null> => {
      const response = await planClient.getPlan({ planId });
      return response.plan ? mapPlanFromProto(response.plan) : null;
    },
    enabled: !!planId,
    staleTime: 30_000,
  });
}

/**
 * Get the currently active plan
 */
export function useActivePlan() {
  const { data: plans, ...rest } = usePlans("active");
  return {
    ...rest,
    data: plans?.[0] ?? null,
  };
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new plan
 */
export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      currencyCode?: string;
      categoryGroups?: unknown[];
    }) => {
      const response = await planClient.createPlan({
        name: input.name,
        description: input.description ?? "",
        currencyCode: input.currencyCode ?? "EUR",
        categoryGroups: (input.categoryGroups ?? []) as [],
      });
      return response.plan ? mapPlanFromProto(response.plan) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

/**
 * Update an existing plan
 */
export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      planId: string;
      name?: string;
      description?: string;
      items?: Array<{ itemId: string; budgetedMinor: number }>;
    }) => {
      const response = await planClient.updatePlan({
        planId: input.planId,
        name: input.name,
        description: input.description,
        items:
          input.items?.map((i) => ({
            itemId: i.itemId,
            budgetedMinor: BigInt(i.budgetedMinor),
          })) ?? [],
      });
      return response.plan ? mapPlanFromProto(response.plan) : null;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["plan", variables.planId] });
    },
  });
}

/**
 * Delete a plan (soft delete - archives it)
 */
export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      await planClient.deletePlan({ planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

/**
 * Set a plan as active
 */
export function useSetActivePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (planId: string) => {
      const response = await planClient.setActivePlan({ planId });
      return response.plan ? mapPlanFromProto(response.plan) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

/**
 * Duplicate a plan
 */
export function useDuplicatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { planId: string; newName: string }) => {
      const response = await planClient.duplicatePlan({
        planId: input.planId,
        newName: input.newName,
      });
      return response.plan ? mapPlanFromProto(response.plan) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

// ============================================================================
// Excel Flow Types
// ============================================================================

export interface ExcelSheetInfo {
  name: string;
  isLivingPlan: boolean; // Has formulas
  rowCount: number;
  formulaCount: number;
  detectedCategories: string[];
  monthColumns: string[]; // e.g., ["jan-26", "feb-26"]
}

export interface ExcelAnalysisResult {
  sheets: ExcelSheetInfo[];
  suggestedSheet: string;
}

// ============================================================================
// Excel Analysis and Import Hooks
// ============================================================================

/**
 * Analyze an Excel file to detect sheets and structure
 */
export function useAnalyzeExcel() {
  return useMutation({
    mutationFn: async (input: { fileId: string }): Promise<ExcelAnalysisResult> => {
      const response = await planClient.analyzeExcelForPlan({
        fileId: input.fileId,
      });

      return {
        sheets: (response.sheets ?? []).map((s) => ({
          name: s.name ?? "",
          isLivingPlan: s.isLivingPlan ?? false,
          rowCount: s.rowCount ?? 0,
          formulaCount: s.formulaCount ?? 0,
          detectedCategories: s.detectedCategories ?? [],
          monthColumns: s.monthColumns ?? [],
        })),
        suggestedSheet: response.suggestedSheet ?? "",
      };
    },
  });
}

/**
 * Import a plan from an Excel file
 */
export function useImportFromExcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      fileId: string;
      sheetName: string;
      mapping?: {
        categoryColumn?: string;
        valueColumn?: string;
        headerRow?: number;
        hasPercentageColumn?: boolean;
        percentageColumn?: string;
      };
    }) => {
      const response = await planClient.importPlanFromExcel({
        fileId: input.fileId,
        sheetName: input.sheetName,
        mapping: input.mapping
          ? {
              categoryColumn: input.mapping.categoryColumn ?? "A",
              valueColumn: input.mapping.valueColumn ?? "B",
              headerRow: input.mapping.headerRow ?? 1,
              hasPercentageColumn: input.mapping.hasPercentageColumn ?? false,
              percentageColumn: input.mapping.percentageColumn ?? "",
            }
          : undefined,
      });
      return response.plan ? mapPlanFromProto(response.plan) : null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
}

/**
 * Upload a file to storage and get a file ID
 * Uses ImportService.UploadUserFile RPC
 */
export async function uploadExcelFile(
  uri: string,
  filename: string,
): Promise<{ fileId: string; storageUrl: string }> {
  // Dynamically import the client to handle the import client
  const { importClient } = await import("@/lib/api/client");

  // Read file from uri using fetch (works for file:// URIs from expo-document-picker)
  const response = await fetch(uri);
  const blob = await response.blob();
  const bytes = new Uint8Array(await blob.arrayBuffer());

  // Determine file type from extension
  const isXlsx = filename.toLowerCase().endsWith(".xlsx");
  const fileType = isXlsx ? 2 : 1; // 2 = XLSX, 1 = CSV (proto enum values)

  // Get MIME type
  const mimeType = isXlsx
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "application/vnd.ms-excel";

  // Call the upload RPC
  const uploadResponse = await importClient.uploadUserFile({
    type: fileType,
    mimeType,
    fileName: filename,
    fileBytes: bytes,
  });

  if (!uploadResponse.file) {
    throw new Error("Upload failed - no file returned");
  }

  return {
    fileId: uploadResponse.file.id ?? "",
    storageUrl: uploadResponse.file.storageUrl ?? "",
  };
}

// ============================================================================
// Mapping Helpers
// ============================================================================

function mapPlanFromProto(proto: {
  id?: string;
  name?: string;
  description?: string;
  status?: number;
  sourceType?: number;
  totalIncome?: { amountMinor?: bigint; currencyCode?: string };
  totalExpenses?: { amountMinor?: bigint; currencyCode?: string };
  surplus?: { amountMinor?: bigint; currencyCode?: string };
  categoryGroups?: Array<{
    id?: string;
    name?: string;
    color?: string;
    targetPercent?: number;
    labels?: Record<string, string>;
    categories?: Array<{
      id?: string;
      name?: string;
      icon?: string;
      labels?: Record<string, string>;
      items?: Array<{
        id?: string;
        name?: string;
        budgeted?: { amountMinor?: bigint };
        actual?: { amountMinor?: bigint };
        excelCell?: string;
        formula?: string;
        widgetType?: number;
        fieldType?: number;
        labels?: Record<string, string>;
      }>;
    }>;
  }>;
}): UserPlan {
  const currencyCode = proto.totalIncome?.currencyCode ?? "EUR";

  return {
    id: proto.id ?? "",
    name: proto.name ?? "",
    description: proto.description,
    status: mapStatus(proto.status ?? 0),
    sourceType: mapSourceType(proto.sourceType ?? 0),
    totalIncome: toMajor(proto.totalIncome?.amountMinor),
    totalExpenses: toMajor(proto.totalExpenses?.amountMinor),
    surplus: toMajor(proto.surplus?.amountMinor),
    currencyCode,
    categoryGroups: (proto.categoryGroups ?? []).map((g) => ({
      id: g.id ?? "",
      name: g.name ?? "",
      color: g.color,
      targetPercent: g.targetPercent ?? 0,
      labels: g.labels ?? {},
      categories: (g.categories ?? []).map((c) => ({
        id: c.id ?? "",
        name: c.name ?? "",
        icon: c.icon,
        labels: c.labels ?? {},
        items: (c.items ?? []).map((i) => ({
          id: i.id ?? "",
          name: i.name ?? "",
          budgeted: toMajor(i.budgeted?.amountMinor),
          actual: toMajor(i.actual?.amountMinor),
          excelCell: i.excelCell,
          formula: i.formula,
          widgetType: mapWidgetType(i.widgetType ?? 0),
          fieldType: mapFieldType(i.fieldType ?? 0),
          labels: i.labels ?? {},
        })),
      })),
    })),
  };
}

function mapWidgetType(proto: number): "input" | "slider" | "toggle" | "readonly" {
  switch (proto) {
    case 1:
      return "input";
    case 2:
      return "slider";
    case 3:
      return "toggle";
    case 4:
      return "readonly";
    default:
      return "input";
  }
}

function mapFieldType(proto: number): "currency" | "percentage" | "number" | "text" {
  switch (proto) {
    case 1:
      return "currency";
    case 2:
      return "percentage";
    case 3:
      return "number";
    case 4:
      return "text";
    default:
      return "currency";
  }
}

function mapStatusToProto(status: PlanStatus): ProtoPlanStatus {
  switch (status) {
    case "draft":
      return 1 as ProtoPlanStatus;
    case "active":
      return 2 as ProtoPlanStatus;
    case "archived":
      return 3 as ProtoPlanStatus;
    default:
      return 0 as ProtoPlanStatus;
  }
}
