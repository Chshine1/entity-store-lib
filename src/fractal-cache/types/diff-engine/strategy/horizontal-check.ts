import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {IQueryBindingStore} from "@/fractal-cache/types/query-binding-store.ts";
import type {HorizontalResult} from "@/fractal-cache/types/diff-engine";

/**
 * Strategy interface for horizontal checks (ID-level cache analysis).
 * Determines which indices in the target window [skip, skip+take) have cached entity IDs
 * and which intervals are missing.
 */
export interface HorizontalCheckStrategy {
  /**
   * Performs horizontal check to determine cached entity IDs and missing intervals.
   * @param intent - The intent specifying the target window and query parameters
   * @param bindingStore - The query binding store containing cached list query results
   * @returns HorizontalResult containing cached IDs, missing intervals, and fetch flags
   */
  check(intent: Intent, bindingStore: IQueryBindingStore): HorizontalResult;
}