import type {BaseEntity} from "@/types";
import type {FilterAST} from "@/fractal-cache/core.ts";

/**
 * Normalized storage unit for a single entity.
 * All entity instances are deduplicated by (type, id) in the NEP.
 */
export interface EntityRecord<T extends BaseEntity> {
  /** Immutable identity fields (id, type, createdAt, etc.) */
  base: BaseEntity;
  
  /** Loaded business fields, may be partial */
  data: Partial<Omit<T, keyof BaseEntity>>;
  
  /** Explicitly known present fields – fields **not** in this set are considered missing */
  fieldMask: Set<keyof Omit<T, keyof BaseEntity>>;
  
  /** Relation names → array of target entity IDs (pure references, no nesting) */
  relations: {
    [relationName: string]: string[];
  };
  
  /** Metadata for cache control and optimistic UI */
  meta: {
    /** Timestamp of last read (for LRU eviction) */
    lastAccess: number;
    /** Optional server version for invalidation */
    version?: number;
    /** Whether this record comes from an uncommitted optimistic mutation */
    isOptimistic: boolean;
  };
}

/**
 * Interface for the **Normalized Entity Pool (NEP)**.
 * Responsible for storing and retrieving entity records by (type, id).
 */
export interface INormalizedEntityPool {
  /**
   * Retrieve a single entity record.
   * @returns the record or `undefined` if not cached.
   */
  getRecord<T extends BaseEntity>(type: string, id: string): EntityRecord<T> | undefined;
  
  /**
   * Apply an in-place update to an existing record.
   * If the record does not exist, the updater is **not** called.
   * Used by reconciler to merge fetched fields/relations.
   */
  updateRecord<T extends BaseEntity>(
    type: string,
    id: string,
    updater: (rec: EntityRecord<T>) => void
  ): void;
  
  /** Batch version of `getRecord`. May contain `undefined` for missing ids. */
  getRecords<T extends BaseEntity>(type: string, ids: string[]): Array<EntityRecord<T> | undefined>;
  
  /**
   * Locally query entity records **already in the cache** using a filter AST.
   * This is a client‑side scan, **not** a server request.
   */
  findRecords<T extends BaseEntity>(type: string, filter: FilterAST): Array<EntityRecord<T>>;
  
  /** Optional: remove an entity from the pool (e.g. on deletion or explicit eviction). */
  deleteRecord?(type: string, id: string): void;
}