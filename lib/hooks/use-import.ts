/**
 * React Query hooks for transaction imports
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { financeClient } from "../api/client";

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
      };
      headerRows?: number;
    }) => {
      const response = await financeClient.importTransactionsCsv({
        csvBytes,
        accountId,
        dateFormat: dateFormat ?? "",
        timezone: timezone ?? "",
        mapping: mapping ?? undefined,
        headerRows: headerRows ?? 0,
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

  // Find header row (look for known keywords)
  const headerKeywords = [
    "data",
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
  for (let i = 0; i < Math.min(20, lines.length); i++) {
    const lineLower = lines[i].toLowerCase();
    const hasKeyword = headerKeywords.some((kw) => lineLower.includes(kw));
    if (hasKeyword) {
      headerIndex = i;
      break;
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

  // Generate a simple fingerprint
  const fingerprint = headers.join("|").toLowerCase();

  return {
    headers,
    sampleRows,
    delimiter,
    skipLines: headerIndex,
    fingerprint,
    suggestions,
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
