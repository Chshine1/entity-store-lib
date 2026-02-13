import type {
  FieldFetchStrategy,
  HorizontalCheckStrategy,
  PaginationRequestStrategy, RelationRequestStrategy, RequestDeduplicationStrategy,
  VerticalCheckStrategy
} from "@/fractal-cache/types/diff-engine/strategy";

/**
 * Configuration for DiffEngine.
 * It holds instances of all pluggable strategies that control the diff computation behavior.
 */
export interface DiffEngineConfig {
  /**
   * Strategy for horizontal check: determines which indices in the target window have cached entity IDs
   * and which intervals are missing.
   */
  horizontalCheck: HorizontalCheckStrategy;
  
  /**
   * Strategy for vertical check: examines which fields are missing for a list of entity IDs.
   */
  verticalCheck: VerticalCheckStrategy;
  
  /**
   * Strategy for generating field-fetch requests based on the field missing map.
   */
  fieldFetch: FieldFetchStrategy;
  
  /**
   * Strategy for generating pagination requests based on missing intervals.
   */
  paginationRequest: PaginationRequestStrategy;
  
  /**
   * Strategy for generating relation (nested) requests for a given relation intent and parent IDs.
   */
  relationRequest: RelationRequestStrategy;
  
  /**
   * Optional strategy for deduplicating and merging generated requests.
   * If not provided, no deduplication is performed.
   */
  requestDeduplication?: RequestDeduplicationStrategy;
}