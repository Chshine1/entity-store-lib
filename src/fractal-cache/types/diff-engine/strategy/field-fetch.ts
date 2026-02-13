import type {FetchContext} from "@/fractal-cache/types/diff-engine/fetch-context.ts";
import type {DataRequest} from "@/fractal-cache/types/diff-engine/abstractions.ts";

export interface FieldFetchStrategy {
  generateRequests(
    missingMap: FieldMissingMap,
    entityType: string,
    context: FetchContext
  ): DataRequest[];
}