import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {DataRequest, FetchContext} from "@/fractal-cache/types/diff-engine";

/**
 * Strategy interface for generating pagination requests.
 * Creates DataRequest objects to fetch missing intervals in paginated lists.
 */
export interface PaginationRequestStrategy {
  /**
   * Generates pagination requests for the given missing intervals.
   * @param missingIntervals - Array of [start, end] intervals that need to be fetched
   * @param intent - The original intent for the query
   * @param context - The fetch context containing intent and utility functions
   * @returns Array of DataRequest objects for pagination
   */
  generateRequests(
    missingIntervals: Array<[number, number]>,
    intent: Intent,
    context: FetchContext
  ): DataRequest[];
}