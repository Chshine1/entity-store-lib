import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {FieldMissingMap} from "@/fractal-cache/types/diff-engine/types.ts";

export interface VerticalCheckStrategy {
  check(
    entityType: string,
    ids: string[],
    requiredFields: Set<string>,
    entityPool: INormalizedEntityPool
  ): FieldMissingMap;
}