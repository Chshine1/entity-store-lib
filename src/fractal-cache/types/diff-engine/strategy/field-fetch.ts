import type {DataRequest, FetchContext, FieldMissingMap} from "@/fractal-cache/types/diff-engine/types.ts";

export interface FieldFetchStrategy {
  generateRequests(
    missingMap: FieldMissingMap,
    entityType: string,
    context: FetchContext
  ): DataRequest[];
}