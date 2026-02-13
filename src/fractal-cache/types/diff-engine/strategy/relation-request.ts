import type {RelationIntent} from "@/fractal-cache/types/intent-parser.ts";
import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {DataRequest, FetchContext} from "@/fractal-cache/types/diff-engine";

export interface RelationRequestStrategy {
  generateRequests(
    relationIntent: RelationIntent,
    parentIds: string[],
    entityPool: INormalizedEntityPool,
    context: FetchContext
  ): DataRequest[];
}