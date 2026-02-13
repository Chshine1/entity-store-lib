import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {DataRequest, FetchContext} from "@/fractal-cache/types/diff-engine";

export interface PaginationRequestStrategy {
  generateRequests(
    missingIntervals: Array<[number, number]>,
    intent: Intent,
    context: FetchContext
  ): DataRequest[];
}