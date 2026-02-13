import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {FilterAST, OrderSpec} from "@/fractal-cache/core.ts";

/**
 * Mode of a DataRequest – either fetch by concrete IDs, or fetch a pagination slice.
 */
export type DataRequestMode =
  | { type: "id"; ids: string[] }          // fetch full entities for given IDs
  | { type: "pagination"; skip: number; take: number }; // fetch a slice of sorted/filtered list

/**
 * Unified request descriptor.
 * It can be used to:
 * - fetch a paginated ID list (pagination mode)
 * - fetch full entities for given IDs (id mode)
 * In both cases, the backend **should** return complete entity data for the requested fields.
 */
export interface DataRequest {
  entityType: string;
  mode: DataRequestMode;
  
  /** Filter condition – required even for id mode (used by backend to apply security/consistency) */
  where: FilterAST;
  /** Sorting – required for pagination mode, optional for id mode (but kept for consistency) */
  orderBy: OrderSpec[];
  
  /** Fields to retrieve; if omitted, backend should return all fields */
  select?: Set<string>;
  
  /**
   * Extra context for the Reconciler.
   * For relation requests, we need to know how to attach the fetched child IDs to each parent.
   */
  metadata?: {
    parentBatch?: Array<{
      parentId: string;
      paramHash: string;       // hash of the relation parameters (including parentId)
      originalSkip: number;    // original skip requested by this parent
      originalTake: number;    // original take requested by this parent
    }>;
  };
}

/**
 * A plan that contains zero or more independent requests to be executed by the NetworkAdapter.
 */
export interface FetchPlan {
  requests: DataRequest[];
}

/**
 * Result of the horizontal check (ID‑level cache analysis).
 */
export interface HorizontalResult {
  /** IDs that are already in cache for the requested window, in correct order; missing positions = null */
  windowIds: Array<string | null>;
  /** Index intervals that are not yet cached and need to be fetched from server */
  missingIntervals: Array<[number, number]>;
  /** Whether a primary fetch (pagination request) is needed */
  needIdFetch: boolean;
}

/**
 * Core interface of the caching engine.
 * Compares an Intent against the current cache (NEP + QBS) and produces a minimal FetchPlan.
 */
export interface IDiffEngine {
  computeFetchPlan(intent: Intent): FetchPlan;
}