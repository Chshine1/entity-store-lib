import type {DataRequest} from "@/fractal-cache/types/diff-engine";

/**
 * Strategy interface for request deduplication and merging.
 * Reduces duplicate requests and combines similar requests to minimize network calls.
 */
export interface RequestDeduplicationStrategy {
  /**
   * Removes duplicate requests and merges similar requests where possible.
   * @param requests - Array of DataRequest objects to deduplicate
   * @returns Array of unique DataRequest objects with similar requests merged
   */
  deduplicate(requests: DataRequest[]): DataRequest[];
}