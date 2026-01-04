/**
 * React Query hooks for transaction imports
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeClient, importClient } from "../api/client";

/**
 * Column mapping configuration for CSV import
 */
export interface ColumnMapping {
  dateCol: number;
  descCol: number;
  categoryCol?: number;
  amountCol?: number; // For single amount column
  debitCol?: number; // For separate debit/credit
  creditCol?: number;
  isDoubleEntry: boolean;
  isEuropeanFormat: boolean;
  dateFormat: string;
}

/**
 * Result of file analysis
 */
export interface FileAnalysis {
  headers: string[];
  sampleRows: string[][];
  delimiter: string;
  skipLines: number;
  fingerprint: string;
  suggestions: {
    dateCol: number;
    descCol: number;
    amountCol: number;
    debitCol: number;
    creditCol: number;
    categoryCol: number;
    isDoubleEntry: boolean;
  };
  probedDialect: {
    isEuropeanFormat: boolean;
    dateFormat: string;
    confidence: number;
  };
  mappingFound: boolean;
  canAutoImport: boolean;
}

/**
 * Hook for importing transactions from CSV
 */
export function useImportTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      csvBytes,
      accountId,
      dateFormat,
      timezone,
      mapping,
      headerRows,
      institutionName,
    }: {
      csvBytes: Uint8Array;
      accountId?: string;
      dateFormat?: string;
      timezone?: string;
      mapping?: {
        dateColumn: string;
        descriptionColumn: string;
        amountColumn: string;
        debitColumn: string;
        creditColumn: string;
        isEuropeanFormat?: boolean;
        delimiter?: string;
        skipLines?: number;
      };
      headerRows?: number;
      institutionName?: string;
    }) => {
      const response = await financeClient.importTransactionsCsv({
        csvBytes,
        accountId,
        dateFormat: dateFormat ?? "",
        timezone: timezone ?? "",
        mapping: mapping ?? undefined,
        headerRows: headerRows ?? 0,
        institutionName: institutionName ?? "",
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate transactions query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

/**
 * Utility to convert a File to Uint8Array
 */
export async function fileToBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Hook for analyzing CSV files using backend (unified detection)
 */
export function useAnalyzeCsvFile() {
  return useMutation({
    mutationFn: async (csvBytes: Uint8Array): Promise<FileAnalysis> => {
      const response = await importClient.analyzeCsvFile({ csvBytes });

      // Convert sample rows from proto format
      const sampleRows: string[][] = (response.sampleRows ?? []).map(
        (row: { cells?: string[] }) => row.cells ?? [],
      );

      return {
        headers: response.headers ?? [],
        sampleRows,
        delimiter: response.delimiter ?? ",",
        skipLines: response.skipLines ?? 0,
        fingerprint: response.fingerprint ?? "",
        suggestions: {
          dateCol: response.suggestions?.dateCol ?? -1,
          descCol: response.suggestions?.descCol ?? -1,
          amountCol: response.suggestions?.amountCol ?? -1,
          debitCol: response.suggestions?.debitCol ?? -1,
          creditCol: response.suggestions?.creditCol ?? -1,
          categoryCol: response.suggestions?.categoryCol ?? -1,
          isDoubleEntry: response.suggestions?.isDoubleEntry ?? false,
        },
        probedDialect: {
          isEuropeanFormat: response.probedDialect?.isEuropeanFormat ?? false,
          dateFormat: response.probedDialect?.dateFormat ?? "DD/MM/YYYY",
          confidence: response.probedDialect?.confidence ?? 0.5,
        },
        mappingFound: response.mappingFound ?? false,
        canAutoImport: response.canAutoImport ?? false,
      };
    },
  });
}

/** Routing hint returned by AnalyzeFile */
export type RoutingHint = "transactions" | "planning";

/** Result of unified file analysis with routing hint */
export interface AnalyzeFileResult {
  routingHint: RoutingHint;
  fileType: "csv" | "xlsx";
  csvAnalysis?: FileAnalysis;
  planAnalysis?: {
    sheets: Array<{
      name: string;
      rowCount: number;
      columnCount: number;
      formulaCount: number;
      isLivingPlan: boolean;
      detectedCategories: string[];
      monthColumns: string[];
    }>;
    suggestedSheet: string;
    detectedCategories: string[];
    formulaCount: number;
    isLivingPlan: boolean;
  };
  errorMessage?: string;
}

/**
 * Hook for analyzing any file (CSV/TSV/XLSX) with smart routing
 */
export function useAnalyzeFile() {
  return useMutation({
    mutationFn: async ({
      fileBytes,
      fileName,
      mimeType,
    }: {
      fileBytes: Uint8Array;
      fileName: string;
      mimeType: string;
    }): Promise<AnalyzeFileResult> => {
      const response = await importClient.analyzeFile({ fileBytes, fileName, mimeType });

      // Convert routing hint enum to string
      const routingHint: RoutingHint = response.routingHint === 2 ? "planning" : "transactions";

      // Convert file type enum to string
      const fileType: "csv" | "xlsx" = response.fileType === 2 ? "xlsx" : "csv";

      // Build result
      const result: AnalyzeFileResult = {
        routingHint,
        fileType,
        errorMessage: response.errorMessage || undefined,
      };

      // If CSV analysis is present
      if (response.csvAnalysis) {
        const csv = response.csvAnalysis;
        const sampleRows: string[][] = (csv.sampleRows ?? []).map(
          (row: { cells?: string[] }) => row.cells ?? [],
        );

        result.csvAnalysis = {
          headers: csv.headers ?? [],
          sampleRows,
          delimiter: csv.delimiter ?? ",",
          skipLines: csv.skipLines ?? 0,
          fingerprint: csv.fingerprint ?? "",
          suggestions: {
            dateCol: csv.suggestions?.dateCol ?? -1,
            descCol: csv.suggestions?.descCol ?? -1,
            amountCol: csv.suggestions?.amountCol ?? -1,
            debitCol: csv.suggestions?.debitCol ?? -1,
            creditCol: csv.suggestions?.creditCol ?? -1,
            categoryCol: csv.suggestions?.categoryCol ?? -1,
            isDoubleEntry: csv.suggestions?.isDoubleEntry ?? false,
          },
          probedDialect: {
            isEuropeanFormat: csv.probedDialect?.isEuropeanFormat ?? false,
            dateFormat: csv.probedDialect?.dateFormat ?? "DD/MM/YYYY",
            confidence: csv.probedDialect?.confidence ?? 0.5,
          },
          mappingFound: csv.mappingFound ?? false,
          canAutoImport: csv.canAutoImport ?? false,
        };
      }

      // If plan analysis is present
      if (response.planAnalysis) {
        const plan = response.planAnalysis;
        result.planAnalysis = {
          sheets: (plan.sheets ?? []).map((s: any) => ({
            name: s.name ?? "",
            rowCount: s.rowCount ?? 0,
            columnCount: s.columnCount ?? 0,
            formulaCount: s.formulaCount ?? 0,
            isLivingPlan: s.isLivingPlan ?? false,
            detectedCategories: s.detectedCategories ?? [],
            monthColumns: s.monthColumns ?? [],
          })),
          suggestedSheet: plan.suggestedSheet ?? "",
          detectedCategories: plan.detectedCategories ?? [],
          formulaCount: plan.formulaCount ?? 0,
          isLivingPlan: plan.isLivingPlan ?? false,
        };
      }

      return result;
    },
  });
}

/**
 * Client-side file analyzer (basic preview without backend call)
 * For a complete analysis, you'd call a backend endpoint
 */
export function analyzeFileLocally(content: string): FileAnalysis {
  const lines = content.split("\n").filter((line) => line.trim());

  // Detect delimiter
  const delimiters = [";", "\t", ",", "|"];
  let delimiter = ",";
  let maxCount = 0;

  for (const d of delimiters) {
    const count = (lines[0] || "").split(d).length;
    if (count > maxCount) {
      maxCount = count;
      delimiter = d;
    }
  }

  // Find header row (look for known keywords, prefer lines with MORE columns)
  const headerKeywords = [
    "data mov", // More specific than "data" to avoid matching metadata
    "date",
    "descrição",
    "description",
    "débito",
    "debit",
    "crédito",
    "credit",
    "amount",
    "valor",
  ];

  let headerIndex = 0;
  let bestColumnCount = 0;

  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const lineLower = lines[i].toLowerCase();
    const hasKeyword = headerKeywords.some((kw) => lineLower.includes(kw));

    if (hasKeyword) {
      // Count columns in this line
      const columnCount = lines[i].split(delimiter).length;
      // Prefer lines with MORE columns (real headers have many columns)
      if (columnCount > bestColumnCount) {
        headerIndex = i;
        bestColumnCount = columnCount;
      }
    }
  }

  // If no keyword match found, fall back to line with most columns
  if (bestColumnCount === 0) {
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const columnCount = lines[i].split(delimiter).length;
      if (columnCount > bestColumnCount) {
        headerIndex = i;
        bestColumnCount = columnCount;
      }
    }
  }

  // Parse headers
  const headerLine = lines[headerIndex] || "";
  const headers = headerLine.split(delimiter).map((h) => h.trim());

  // Get sample rows
  const sampleRows: string[][] = [];
  for (let i = headerIndex + 1; i < Math.min(headerIndex + 6, lines.length); i++) {
    if (lines[i]) {
      sampleRows.push(lines[i].split(delimiter).map((c) => c.trim()));
    }
  }

  // Auto-suggest columns
  const suggestions = suggestColumns(headers);

  // Probe regional dialect from sample data
  const probedDialect = probeDialect(sampleRows, suggestions, delimiter);

  // Generate a simple fingerprint
  const fingerprint = headers.join("|").toLowerCase();

  return {
    headers,
    sampleRows,
    delimiter,
    skipLines: headerIndex,
    fingerprint,
    suggestions,
    probedDialect,
    mappingFound: false,
    canAutoImport: false,
  };
}

/**
 * Suggest column mappings based on header names
 */
function suggestColumns(headers: string[]): FileAnalysis["suggestions"] {
  const suggestions = {
    dateCol: -1,
    descCol: -1,
    amountCol: -1,
    debitCol: -1,
    creditCol: -1,
    categoryCol: -1,
    isDoubleEntry: false,
  };

  headers.forEach((header, index) => {
    const h = header.toLowerCase();

    // Date
    if (suggestions.dateCol === -1) {
      if (h.includes("data mov") || h === "date" || h.includes("fecha") || h === "data") {
        suggestions.dateCol = index;
      }
    }

    // Description
    if (suggestions.descCol === -1) {
      if (
        h.includes("descri") ||
        h.includes("merchant") ||
        h === "description" ||
        h === "nome" ||
        h === "name"
      ) {
        suggestions.descCol = index;
      }
    }

    // Debit
    if (suggestions.debitCol === -1) {
      if (
        h.includes("débito") ||
        h.includes("debito") ||
        h.includes("debit") ||
        h.includes("cargo")
      ) {
        suggestions.debitCol = index;
      }
    }

    // Credit
    if (suggestions.creditCol === -1) {
      if (
        h.includes("crédito") ||
        h.includes("credito") ||
        h.includes("credit") ||
        h.includes("abono")
      ) {
        suggestions.creditCol = index;
      }
    }

    // Single amount
    if (suggestions.amountCol === -1) {
      if (h === "amount" || h === "valor" || h === "importe" || h === "montante") {
        suggestions.amountCol = index;
      }
    }

    // Category
    if (suggestions.categoryCol === -1) {
      if (h.includes("categ") || h === "category" || h.includes("tipo") || h === "type") {
        suggestions.categoryCol = index;
      }
    }
  });

  suggestions.isDoubleEntry = suggestions.debitCol !== -1 && suggestions.creditCol !== -1;

  return suggestions;
}

/**
 * Probe regional dialect (European vs US format) from sample data
 */
function probeDialect(
  sampleRows: string[][],
  suggestions: FileAnalysis["suggestions"],
  delimiter: string,
): FileAnalysis["probedDialect"] {
  let europeanHints = 0;
  let usHints = 0;
  let dateIsDDFirst = false;

  // Determine which column to check for amounts
  const amountCol = suggestions.isDoubleEntry ? suggestions.debitCol : suggestions.amountCol;

  for (const row of sampleRows) {
    // Analyze amount column for decimal separator
    if (amountCol >= 0 && amountCol < row.length) {
      const val = row[amountCol];
      const hint = analyzeAmountFormat(val);
      if (hint > 0) europeanHints++;
      else if (hint < 0) usHints++;
    }

    // Analyze date column for DD/MM vs MM/DD
    if (suggestions.dateCol >= 0 && suggestions.dateCol < row.length) {
      const dateVal = row[suggestions.dateCol];
      if (isDateDDFirst(dateVal)) {
        dateIsDDFirst = true;
      }
    }

    // Check for currency symbols
    for (const cell of row) {
      if (cell.includes("€") || cell.includes("EUR")) {
        europeanHints++;
      } else if (cell.includes("R$") || cell.includes("BRL")) {
        europeanHints++; // Brazil uses European format
      } else if (cell.includes("$") && !cell.includes("R$")) {
        usHints++;
      }
    }
  }

  // Also consider delimiter as a hint
  if (delimiter === ";") {
    europeanHints += 2; // Semicolon is very common in European CSVs
  }

  const isEuropeanFormat = europeanHints > usHints;
  const totalHints = europeanHints + usHints;
  const confidence = totalHints > 0 ? Math.max(europeanHints, usHints) / totalHints : 0.5;

  // Determine date format
  let dateFormat = "DD-MM-YYYY";
  if (dateIsDDFirst || isEuropeanFormat) {
    dateFormat = "DD-MM-YYYY";
  } else if (!dateIsDDFirst && !isEuropeanFormat) {
    dateFormat = "MM/DD/YYYY";
  }

  return {
    isEuropeanFormat,
    dateFormat,
    confidence,
  };
}

/**
 * Analyze amount string to determine format: >0 European, <0 US, 0 ambiguous
 */
function analyzeAmountFormat(val: string): number {
  // Clean the value - keep only digits, comma, period, minus
  const cleaned = val.replace(/[^\d,.-]/g, "").replace(/^-/, "");

  if (!cleaned) return 0;

  const hasComma = cleaned.includes(",");
  const hasDot = cleaned.includes(".");

  if (hasComma && hasDot) {
    // Both present: last one is decimal separator
    if (cleaned.lastIndexOf(",") > cleaned.lastIndexOf(".")) {
      return 1; // European: 1.234,56
    }
    return -1; // US: 1,234.56
  }

  if (hasComma && !hasDot) {
    // Only comma: check if it looks like a decimal (max 2 digits after)
    const afterComma = cleaned.split(",").pop() || "";
    if (afterComma.length <= 2) {
      return 1; // Likely European decimal
    }
    return 0; // Could be US thousands separator
  }

  if (hasDot && !hasComma) {
    // Only dot: check if it looks like a decimal
    const afterDot = cleaned.split(".").pop() || "";
    if (afterDot.length <= 2) {
      return -1; // Likely US decimal
    }
    return 0; // Could be European thousands separator
  }

  return 0;
}

/**
 * Check if date is definitely DD-first (day > 12)
 */
function isDateDDFirst(dateVal: string): boolean {
  const parts = dateVal.split(/[/\-.]/); // Split by /, -, or .
  if (parts.length >= 2) {
    const first = parseInt(parts[0], 10);
    if (first > 12 && first <= 31) {
      return true;
    }
  }
  return false;
}
