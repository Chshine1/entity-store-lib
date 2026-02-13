import type {RequestDeduplicationStrategy} from "@/fractal-cache/types/diff-engine/strategy/request-deduplication.ts";
import type {DataRequest} from "@/fractal-cache/types/diff-engine";

interface RequestDeduplicationConfig {
  mergeIdRequests: boolean;
  mergePaginationRequests: boolean;
  idRequestMergeMaxSize: number;
}

export class DefaultDeduplicationStrategy implements RequestDeduplicationStrategy {
  private readonly config: RequestDeduplicationConfig;
  
  constructor(config: RequestDeduplicationConfig) {
    this.config = config;
  }
  
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
  
  private stringifySelect(select?: Set<string>): string {
    if (!select) {
      return 'all';
    }
    return [...select].sort().join(',');
  }
}