import type {FilterAST, OrderSpec} from "@/fractal-cache/core.ts";

/**
 * Describes the **structure** of a list query, without concrete parameters.
 * Used as a key to share pagination state among bindings with same sort & filter shape.
 */
export interface QueryDefinition {
  /** Unique hash: entityType + normalized orderBy + normalized whereTemplate */
  id: string;
  entityType: string;
  orderBy: OrderSpec[];
  /** Filter AST with placeholders (e.g. `{ parentId: { $eq: "$parentId" } }`) */
  whereTemplate: FilterAST;
}

/**
 * A concrete instantiation of a `QueryDefinition` with actual parameter values.
 * Stores the pagination progress (intervals, index→id map) and exhaustion flag.
 */
export interface QueryBinding {
  definitionId: string;
  /** Hash of the actual `parameters` object */
  paramHash: string;
  /** The concrete values that replace placeholders in `whereTemplate` */
  parameters: Record<string, any>;
  
  /** Continuous index intervals that have been fetched, e.g. [[0,9],[20,29]] */
  intervals: Array<[number, number]>;
  /** Index → entity ID. Order is preserved and must match server order. */
  indexToId: Map<number, string>;
  /** Whether the server indicated there are no more items after the last fetched index */
  isExhausted: boolean;
  
  /** Flag indicating the binding should be revalidated on next access */
  dirty: boolean;
  /** Timestamp of last validation (for TTL strategies) */
  lastValidateAt: number;
}

/**
 * Manages query definitions and their concrete bindings.
 * Also provides utility methods for interval merging, ID window extraction,
 * invalidation, and hash computation.
 */
export interface IQueryBindingStore {
  // --- Definition management ---
  getDefinition(defId: string): QueryDefinition | undefined;
  saveDefinition(def: QueryDefinition): void;
  getAllDefinitions(): QueryDefinition[];
  
  // --- Binding management ---
  getBinding(defId: string, paramHash: string): QueryBinding | undefined;
  saveBinding(binding: QueryBinding): void;
  deleteBinding(defId: string, paramHash: string): void;
  findBindingsByDefinition(defId: string): QueryBinding[];
  
  /**
   * Core operation: merge a newly fetched index interval and its ID mapping.
   * Overwrites existing indexToId entries, merges overlapping/adjacent intervals.
   */
  mergeInterval(
    defId: string,
    paramHash: string,
    newInterval: [number, number],
    idMap: Map<number, string>
  ): void;
  
  /**
   * Retrieve IDs for a given window `[skip, skip+take)`.
   * Missing indices yield `null` placeholders.
   */
  getWindowIds(
    defId: string,
    paramHash: string,
    skip: number,
    take: number
  ): Array<string | null>;
  
  /** Mark a binding as dirty (e.g. after receiving invalidation hint) */
  markDirty(defId: string, paramHash: string): void;
  
  /**
   * Invalidate bindings that depend on a specific parent entity.
   * Used when a parent’s relation is updated.
   * @param parentType
   * @param parentId
   * @param relationName – if omitted, all relations of the parent are invalidated.
   */
  invalidateByParent(parentType: string, parentId: string, relationName?: string): void;
  
  // --- Hash utilities (could be static helpers, but placed here for DI) ---
  computeDefinitionId(
    entityType: string,
    orderBy: OrderSpec[],
    whereTemplate: FilterAST
  ): string;
  
  computeParamHash(params: Record<string, any>): string;
}