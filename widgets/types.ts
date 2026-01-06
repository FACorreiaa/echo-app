/**
 * Widget Base Types
 *
 * All intelligent widgets should implement BaseWidgetProps for consistent
 * handling of loading, error, and empty states.
 */

export interface BaseWidgetProps {
  /** Widget title displayed in header */
  title?: string;
  /** Loading state indicator */
  isLoading?: boolean;
  /** Error message to display */
  error?: string;
  /** Last time data was updated */
  lastUpdated?: Date;
  /** Primary action callback */
  onAction?: () => void;
  /** Refresh callback */
  onRefresh?: () => void;
}

export type WidgetState = "loading" | "success" | "error" | "empty";

/**
 * Determine widget state from props
 */
export function getWidgetState(props: {
  isLoading?: boolean;
  error?: string;
  isEmpty?: boolean;
}): WidgetState {
  if (props.isLoading) return "loading";
  if (props.error) return "error";
  if (props.isEmpty) return "empty";
  return "success";
}
