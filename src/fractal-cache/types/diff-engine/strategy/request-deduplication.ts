import type {DataRequest} from "@/fractal-cache/types/diff-engine/abstractions.ts";

export interface RequestDeduplicationStrategy {
  deduplicate(requests: DataRequest[]): DataRequest[];
}