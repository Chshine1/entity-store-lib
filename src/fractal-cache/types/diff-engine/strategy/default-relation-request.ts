import type {RelationRequestStrategy} from "@/fractal-cache/types/diff-engine/strategy/relation-request.ts";
import type {RelationIntent} from "@/fractal-cache/types/intent-parser.ts";
import type {DataRequest} from "@/fractal-cache/types/diff-engine";

/**
 * Configuration options for relation request strategy.
 */
interface RelationRequestConfig {
  /**
   * Batching strategy: 'none' creates individual requests, 'by-parent' creates one per parent,
   * 'by-parent-batch' tries to combine multiple parents into single requests.
   */
  batching: 'none' | 'by-parent' | 'by-parent-batch';
  /**
   * Maximum number of parent IDs in a single batch request.
   */
  maxBatchSize: number;
  /**
   * Whether to check parent entity caches when determining what to fetch.
   */
  useParentCache: boolean;
  /**
   * Whether to inherit pagination parameters from parent entities when batching.
   */
  inheritParentPagination: boolean;
}

/**
 * Default implementation of RelationRequestStrategy.
 * Handles fetching related entities for parent entities specified in include clauses based on configuration options.
 */
export class DefaultRelationRequestStrategy implements RelationRequestStrategy {
  private readonly config: RelationRequestConfig;
  
  /**
   * Creates a new instance with the given configuration.
   * @param config - Configuration options for the relation request strategy
   */
  constructor(config: RelationRequestConfig) {
    this.config = config;
  }
  
  /**
   * Generates relation requests for the given relation intent and parent IDs.
   * @param relationIntent - The intent specifying the relation query
   * @param parentIds - The list of parent entity IDs that need their relations fetched
   * @returns Array of DataRequest objects for relation fetching
   */
  generateRequests(
    relationIntent: RelationIntent,
    parentIds: string[]
  ): DataRequest[] {
    if (parentIds.length === 0) {
      return [];
    }
    
    const requests: DataRequest[] = [];
    
    if (this.config.batching === 'by-parent-batch') {
      // Try to batch multiple parents into single requests
      
      // For now, since we don't have full implementation of relation queries in entities,
      // we'll create individual requests for each parent with batching logic
      for (let i = 0; i < parentIds.length; i += this.config.maxBatchSize) {
        const batch = parentIds.slice(i, i + this.config.maxBatchSize);
        
        // Create a request with IN clause for parent IDs
        const whereCondition = {
          ...relationIntent.where,
          // Assuming there's a field that connects child to parent
          // This would need to be adjusted based on actual relation field name
          parentId: {$in: batch}
        };
        
        const request: DataRequest = {
          entityType: relationIntent.entityType,
          mode: {
            type: 'pagination',
            skip: relationIntent.skip || 0,
            take: relationIntent.take || 10
          },
          where: whereCondition,
          orderBy: relationIntent.orderBy,
          ...(relationIntent.select && {select: relationIntent.select})
        };
        
        requests.push(request);
      }
    } else {
      // Handle 'none' or 'by-parent' - create individual requests for each parent
      for (const parentId of parentIds) {
        // Create a request for this specific parent
        const whereCondition = {
          ...relationIntent.where,
          // Assuming there's a field that connects child to parent
          parentId: parentId
        };
        
        const request: DataRequest = {
          entityType: relationIntent.entityType,
          mode: {
            type: 'pagination',
            skip: relationIntent.skip || 0,
            take: relationIntent.take || 10
          },
          where: whereCondition,
          orderBy: relationIntent.orderBy,
          ...(relationIntent.select && {select: relationIntent.select})
        };
        
        requests.push(request);
      }
    }
    
    return requests;
  }
}