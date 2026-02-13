import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {IQueryBindingStore} from "@/fractal-cache/types/query-binding-store.ts";
import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {OrderSpec} from "@/fractal-cache/core.ts";

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