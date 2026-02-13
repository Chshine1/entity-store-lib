import type {RelationIntent} from "@/fractal-cache/types/intent-parser.ts";
import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {DataRequest, FetchContext} from "@/fractal-cache/types/diff-engine";

/**
 * Strategy interface for generating relation (nested) requests.
 * Handles fetching related entities for parent entities specified in include clauses.
 */
export interface RelationRequestStrategy {
  /**
   * Generates relation requests for the given relation intent and parent IDs.
   * @param relationIntent - The intent specifying the relation query
   * @param parentIds - The list of parent entity IDs that need their relations fetched
   * @param entityPool - The entity pool for accessing cached entity records
   * @param context - The fetch context containing intent and utility functions
   * @returns Array of DataRequest objects for relation fetching
   */
  generateRequests(
    relationIntent: RelationIntent,
    parentIds: string[],
    entityPool: INormalizedEntityPool,
    context: FetchContext
  ): DataRequest[];
}