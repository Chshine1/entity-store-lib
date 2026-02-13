import type {FetchContext} from "@/fractal-cache/types/diff-engine/fetch-context.ts";
import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {DataRequest} from "@/fractal-cache/types/diff-engine/abstractions.ts";

export interface PaginationRequestStrategy {
  generateRequests(
    missingIntervals: Array<[number, number]>,
    intent: Intent,
    context: FetchContext
  ): DataRequest[];
}