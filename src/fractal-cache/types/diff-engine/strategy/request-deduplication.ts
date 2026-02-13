import type {DataRequest} from "@/fractal-cache/types/diff-engine";

export interface RequestDeduplicationStrategy {
  deduplicate(requests: DataRequest[]): DataRequest[];
}