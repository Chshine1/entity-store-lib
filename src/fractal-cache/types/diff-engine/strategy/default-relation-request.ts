import type {RelationRequestStrategy} from "@/fractal-cache/types/diff-engine/strategy/relation-request.ts";
import type {RelationIntent} from "@/fractal-cache/types/intent-parser.ts";
import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {DataRequest, FetchContext} from "@/fractal-cache/types/diff-engine";

interface RelationRequestConfig {
  batching: 'none' | 'by-parent' | 'by-parent-batch';
  maxBatchSize: number;
  useParentCache: boolean;
  inheritParentPagination: boolean;
}

export class DefaultRelationRequestStrategy implements RelationRequestStrategy {
  private readonly config: RelationRequestConfig;
  
  constructor(config: RelationRequestConfig) {
    this.config = config;
  }
  
  generateRequests(
    relationIntent: RelationIntent,
    parentIds: string[],
    _entityPool: INormalizedEntityPool,
    _context: FetchContext
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
          parentId: { $in: batch }
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
          ...(relationIntent.select && { select: relationIntent.select })
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
          ...(relationIntent.select && { select: relationIntent.select })
        };
        
        requests.push(request);
      }
    }
    
    return requests;
  }
}