import type {
  DataRequest,
  DiffEngineConfig,
  FetchContext,
  FetchPlan,
  IDiffEngine
} from "@/fractal-cache/types/diff-engine/types.ts";
import type {IQueryBindingStore} from "@/fractal-cache/types/query-binding-store.ts";
import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";

/**
 * Core DiffEngine implementation that coordinates different strategies to compute fetch plans.
 * The engine follows a fixed workflow:
 * 1. Horizontal check -> Gets cached IDs and missing intervals in the target window
 * 2. Vertical check -> Checks field completeness for cached entities
 * 3. Generate pagination requests -> For missing intervals
 * 4. Generate field completion requests -> For missing fields
 * 5. Generate relation requests -> For included relations
 * 6. Deduplicate and merge -> Combine similar requests
 */
export class DiffEngine implements IDiffEngine {
  private readonly config: DiffEngineConfig;
  private readonly entityPool: INormalizedEntityPool;
  private readonly bindingStore: IQueryBindingStore;
  
  constructor(config: DiffEngineConfig, entityPool: INormalizedEntityPool, bindingStore: IQueryBindingStore) {
    this.config = config;
    this.entityPool = entityPool;
    this.bindingStore = bindingStore;
  }
  
  /**
   * Computes a fetch plan based on the provided intent and current cache state.
   * This method orchestrates the various strategies to determine what data needs to be fetched.
   * @param intent - The intent specifying what data to fetch
   * @returns A fetch plan containing all necessary requests
   */
  computeFetchPlan(intent: Intent): FetchPlan {
    const context: FetchContext = {
      intent,
      entityPool: this.entityPool,
      bindingStore: this.bindingStore,
      utils: {
        computeDefinitionId,
        computeParamHash,
        extractTemplate,
        extractParams,
      }
    };
    
    // Step 1: Horizontal check
    const horizontalResult = this.config.horizontalCheck.check(intent, this.bindingStore);
    
    // Get cached entity IDs from the window (non-null values)
    const cachedIds = horizontalResult.windowIds.filter(id => id !== null) as string[];
    
    // Step 2: Vertical check
    const missingMap = this.config.verticalCheck.check(
      intent.entityType,
      cachedIds,
      intent.select || new Set(),
      this.entityPool
    );
    
    // Step 3: Generate pagination requests
    const paginationRequests = this.config.paginationRequest.generateRequests(
      horizontalResult.missingIntervals,
      intent,
      context
    );
    
    // Step 4: Generate field completion requests
    const fieldRequests = this.config.fieldFetch.generateRequests(
      missingMap,
      intent.entityType,
      context
    );
    
    // Step 5: Generate relation requests
    let relationRequests: DataRequest[] = [];
    if (intent.include) {
      for (const rel of intent.include) {
        // Parent ID list = all cached entity IDs in the current window
        // Note: If there are missing IDs in the window, there may be only partial parent entities,
        // but relationship queries typically rely on existing parent entities
        // A more precise approach might be to get all possible parent entity IDs from the entityPool,
        // but for simplicity, we use cachedIds
        const relReqs = this.config.relationRequest.generateRequests(
          rel,
          cachedIds,
          this.entityPool,
          context
        );
        relationRequests.push(...relReqs);
      }
    }
    
    // Step 6: Deduplicate and merge
    let allRequests = [...paginationRequests, ...fieldRequests, ...relationRequests];
    if (this.config.requestDeduplication) {
      allRequests = this.config.requestDeduplication.deduplicate(allRequests);
    }
    
    return {requests: allRequests};
  }
}

/**
 * Default implementations of utility functions that are not yet implemented.
 * These will throw errors to indicate they need to be properly implemented.
 */

function computeDefinitionId(_entityType: string, _orderBy: any[], _whereTemplate: any): string {
  throw new Error("computeDefinitionId is not implemented yet");
}

function computeParamHash(_params: any): string {
  throw new Error("computeParamHash is not implemented yet");
}

function extractTemplate(_where: any): any {
  throw new Error("extractTemplate is not implemented yet");
}

function extractParams(_where: any): any {
  throw new Error("extractParams is not implemented yet");
}