import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";

export interface VerticalCheckStrategy {
  check(
    entityType: string,
    ids: string[],
    requiredFields: Set<string>,
    entityPool: INormalizedEntityPool
  ): FieldMissingMap;
}