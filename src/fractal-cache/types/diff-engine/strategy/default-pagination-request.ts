import type {PaginationRequestStrategy} from "@/fractal-cache/types/diff-engine/strategy/pagination.ts";
import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {DataRequest, FetchContext} from "@/fractal-cache/types/diff-engine";

interface PaginationRequestConfig {
  intervalMergeStrategy: 'none' | 'adjacent' | 'all';
  allowOverfetch: boolean;
  maxTakePerRequest: number;
}

export class DefaultPaginationRequestStrategy implements PaginationRequestStrategy {
  private readonly config: PaginationRequestConfig;
  
  constructor(config: PaginationRequestConfig) {
    this.config = config;
  }
  
  generateRequests(
    missingIntervals: Array<[number, number]>,
    intent: Intent,
    _context: FetchContext
  ): DataRequest[] {
    if (missingIntervals.length === 0) {
      return [];
    }
    
    // Apply interval merge strategy
    let processedIntervals: Array<[number, number]> = [...missingIntervals];
    
    switch (this.config.intervalMergeStrategy) {
      case 'adjacent':
        processedIntervals = this.mergeAdjacentIntervals(processedIntervals);
        break;
      case 'all':
        if (processedIntervals.length > 0) {
          const minStart = Math.min(...processedIntervals.map(interval => interval[0]));
          const maxEnd = Math.max(...processedIntervals.map(interval => interval[1]));
          processedIntervals = [[minStart, maxEnd]];
        }
        break;
      case 'none':
        // No merging
        break;
    }
    
    // Apply window clipping if overfetch is not allowed
    if (!this.config.allowOverfetch) {
      const windowStart = intent.skip;
      const windowEnd = intent.skip + intent.take - 1;
      
      const filteredIntervals: Array<[number, number]> = [];
      for (const [start, end] of processedIntervals) {
        const newStart = Math.max(start, windowStart);
        const newEnd = Math.min(end, windowEnd);
        if (newStart <= newEnd) {
          filteredIntervals.push([newStart, newEnd]); // Remove invalid intervals
        }
      }
      processedIntervals = filteredIntervals;
    }
    
    const requests: DataRequest[] = [];
    
    // Split intervals if they exceed maxTakePerRequest
    for (const [start, end] of processedIntervals) {
      const intervalLength = end - start + 1;
      
      if (intervalLength <= this.config.maxTakePerRequest) {
        // Single request for this interval
        const request: DataRequest = {
          entityType: intent.entityType,
          mode: { type: 'pagination', skip: start, take: intervalLength },
          where: intent.where,
          orderBy: intent.orderBy,
          ...(intent.select && { select: intent.select })
        };
        
        requests.push(request);
      } else {
        // Split the interval into multiple requests
        let currentStart = start;
        while (currentStart <= end) {
          const currentTake = Math.min(this.config.maxTakePerRequest, end - currentStart + 1);
          
          const request: DataRequest = {
            entityType: intent.entityType,
            mode: { type: 'pagination', skip: currentStart, take: currentTake },
            where: intent.where,
            orderBy: intent.orderBy,
            ...(intent.select && { select: intent.select })
          };
          
          requests.push(request);
          
          currentStart += currentTake;
        }
      }
    }
    
    return requests;
  }
  
  private mergeAdjacentIntervals(intervals: Array<[number, number]>): Array<[number, number]> {
    if (intervals.length <= 1) return intervals;
    
    // Sort intervals by start position
    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
    const merged: Array<[number, number]> = [];
    
    if (sorted.length === 0) return merged;
    
    let currentStart = sorted[0][0];
    let currentEnd = sorted[0][1];
    
    for (let i = 1; i < sorted.length; i++) {
      const [nextStart, nextEnd] = sorted[i];
      
      // If intervals are adjacent or overlapping, merge them
      if (nextStart <= currentEnd + 1) {
        currentEnd = Math.max(currentEnd, nextEnd);
      } else {
        // Add the current interval and start a new one
        merged.push([currentStart, currentEnd]);
        currentStart = nextStart;
        currentEnd = nextEnd;
      }
    }
    
    // Add the last interval
    merged.push([currentStart, currentEnd]);
    
    return merged;
  }
}