import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {FieldMissingMap} from "@/fractal-cache/types/diff-engine/types.ts";

/**
 * Strategy interface for vertical checks (field-level cache analysis).
 * Examines which fields are missing for a list of entity IDs.
 */
export interface VerticalCheckStrategy {
  /**
   * Performs vertical check to determine missing fields for the given entity IDs.
   * @param entityType - The type of entities being checked
   * @param ids - The list of entity IDs to check
   * @param requiredFields - The set of fields that are required
   * @param entityPool - The entity pool containing cached entity records
   * @returns FieldMissingMap mapping entity IDs to sets of missing fields
   */
  check(
    entityType: string,
    ids: string[],
    requiredFields: Set<string>,
    entityPool: INormalizedEntityPool
  ): FieldMissingMap;
}