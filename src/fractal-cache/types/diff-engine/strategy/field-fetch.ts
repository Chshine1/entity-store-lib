import type {DataRequest, FetchContext, FieldMissingMap} from "@/fractal-cache/types/diff-engine/types.ts";

/**
 * Strategy interface for generating field completion requests.
 * Generates DataRequest objects to fetch missing fields for entities.
 */
export interface FieldFetchStrategy {
  /**
   * Generates field completion requests based on the field missing map.
   * @param missingMap - Map of entity IDs to sets of missing fields
   * @param entityType - The type of entities needing field completion
   * @param context - The fetch context containing intent and utility functions
   * @returns Array of DataRequest objects for field completion
   */
  generateRequests(
    missingMap: FieldMissingMap,
    entityType: string,
    context: FetchContext
  ): DataRequest[];
}