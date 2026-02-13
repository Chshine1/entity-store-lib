import type {RequestDeduplicationStrategy} from "@/fractal-cache/types/diff-engine/strategy/request-deduplication.ts";
import type {DataRequest} from "@/fractal-cache/types/diff-engine";

/**
 * Configuration options for request deduplication strategy.
 */
interface RequestDeduplicationConfig {
  /**
   * Whether to merge ID requests with the same entity type and selection.
   */
  mergeIdRequests: boolean;
  /**
   * Whether to merge pagination requests with similar parameters.
   */
  mergePaginationRequests: boolean;
  /**
   * Maximum number of IDs in a merged ID request.
   */
  idRequestMergeMaxSize: number;
}

/**
 * Default implementation of RequestDeduplicationStrategy.
 * Reduces duplicate requests and combines similar requests to minimize network calls based on configuration options.
 */
export class DefaultDeduplicationStrategy implements RequestDeduplicationStrategy {
  private readonly config: RequestDeduplicationConfig;
  
  /**
   * Creates a new instance with the given configuration.
   * @param config - Configuration options for the request deduplication strategy
   */
  constructor(config: RequestDeduplicationConfig) {
    this.config = config;
  }
  
  /**
   * Removes duplicate requests and merges similar requests where possible.
   * @param requests - Array of DataRequest objects to deduplicate
   * @returns Array of unique DataRequest objects with similar requests merged
   */
  deduplicate(requests: DataRequest[]): DataRequest[] {
    if (requests.length <= 1) {
      return requests;
    }
    
    const processedRequests: DataRequest[] = [];
    const idRequestMap = new Map<string, DataRequest>();
    
    for (const request of requests) {
      if (request.mode.type === 'id' && this.config.mergeIdRequests) {
        // Create a key for this ID request based on entity type and select
        const key = `${request.entityType}|${this.stringifySelect(request.select)}`;
        
        if (idRequestMap.has(key)) {
          // Merge with existing request
          const existingRequest = idRequestMap.get(key)!;
          
          // Only merge if both requests are ID mode
          if (existingRequest.mode.type === 'id' && request.mode.type === 'id') {
            const newIds = [...new Set([...existingRequest.mode.ids, ...request.mode.ids])];
            
            if (newIds.length <= this.config.idRequestMergeMaxSize) {
              // Update the existing request's mode to include merged IDs
              existingRequest.mode = {type: 'id', ids: newIds};
            } else {
              // If merged size exceeds max, add as separate request
              processedRequests.push(request);
            }
          } else {
            // If modes don't match, add as separate request
            processedRequests.push(request);
          }
        } else {
          idRequestMap.set(key, {...request});
        }
      } else {
        // For non-ID requests or when merging is disabled, add directly
        processedRequests.push(request);
      }
    }
    
    // Add all merged ID requests to the result
    for (const request of idRequestMap.values()) {
      processedRequests.push(request);
    }
    
    return processedRequests;
  }
  
  /**
   * Converts a selection set to a string representation for comparison.
   * @param select - Set of field names to convert
   * @returns String representation of the selection set
   * @private
   */
  private stringifySelect(select?: Set<string>): string {
    if (!select) {
      return 'all';
    }
    return [...select].sort().join(',');
  }
}