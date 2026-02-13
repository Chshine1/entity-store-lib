import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {IQueryBindingStore} from "@/fractal-cache/types/query-binding-store.ts";
import type {FilterAST, OrderSpec} from "@/fractal-cache/core.ts";
import type {
  FieldFetchStrategy,
  HorizontalCheckStrategy,
  PaginationRequestStrategy,
  RelationRequestStrategy,
  RequestDeduplicationStrategy,
  VerticalCheckStrategy
} from "@/fractal-cache/types/diff-engine/strategy";

/**
 * Mapping of entity IDs to sets of missing fields for those entities.
 * Used by vertical check strategies to report which fields are missing for each entity ID.
 */
export type FieldMissingMap = Map<string, Set<string>>;


/**
 * Context object passed to strategies during fetch plan computation.
 * It provides access to storage, the original intent, and utility functions.
 */
export interface FetchContext {
  /**
   * The original intent for which the fetch plan is being computed.
   */
  intent: Intent;
  
  /**
   * The entity pool for accessing cached entity records.
   */
  entityPool: INormalizedEntityPool;
  
  /**
   * The query binding store for accessing cached list query results.
   */
  bindingStore: IQueryBindingStore;
  
  /**
   * Utility functions for hashing and extracting query templates/parameters.
   */
  utils: {
    /**
     * Computes a definition ID based on entity type, orderBy, and the template of where conditions.
     * @param entityType - The entity type name.
     * @param orderBy - The order specification array.
     * @param whereTemplate - The template part of where conditions (with placeholders for parameters).
     * @returns A string that uniquely identifies the query shape.
     */
    computeDefinitionId: (entityType: string, orderBy: OrderSpec[], whereTemplate: any) => string;
    
    /**
     * Computes a hash for the parameter values of a where condition.
     * @param params - The extracted parameter values.
     * @returns A string hash.
     */
    computeParamHash: (params: any) => string;
    
    /**
     * Extracts the template part from a full where condition object.
     * The template replaces actual parameter values with placeholders.
     * @param where - The full where condition.
     * @returns The template object.
     */
    extractTemplate: (where: any) => any;
    
    /**
     * Extracts the parameter values from a full where condition object.
     * @param where - The full where condition.
     * @returns An object containing all parameter values.
     */
    extractParams: (where: any) => any;
  };
}

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

/**
 * Configuration for DiffEngine.
 * It holds instances of all pluggable strategies that control the diff computation behavior.
 */
export interface DiffEngineConfig {
  /**
   * Strategy for horizontal check: determines which indices in the target window have cached entity IDs
   * and which intervals are missing.
   */
  horizontalCheck: HorizontalCheckStrategy;
  
  /**
   * Strategy for vertical check: examines which fields are missing for a list of entity IDs.
   */
  verticalCheck: VerticalCheckStrategy;
  
  /**
   * Strategy for generating field-fetch requests based on the field missing map.
   */
  fieldFetch: FieldFetchStrategy;
  
  /**
   * Strategy for generating pagination requests based on missing intervals.
   */
  paginationRequest: PaginationRequestStrategy;
  
  /**
   * Strategy for generating relation (nested) requests for a given relation intent and parent IDs.
   */
  relationRequest: RelationRequestStrategy;
  
  /**
   * Optional strategy for deduplicating and merging generated requests.
   * If not provided, no deduplication is performed.
   */
  requestDeduplication?: RequestDeduplicationStrategy;
}