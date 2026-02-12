import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {FilterAST, OrderSpec} from "@/fractal-cache/core.ts";

type DataRequestMode = {
  type: "id";
  ids: string[];
} | {
  type: "pagination";
  skip: number;
  take: number;
}

export interface DataRequest {
  entityType: string;
  mode: DataRequestMode;
  
  where: FilterAST;
  orderBy: OrderSpec[];
  
  select?: Set<string>;
  
  metadata?: {
    parentBatch?: Array<{
      parentId: string;
      paramHash: string;
      originalSkip: number;
      originalTake: number;
    }>;
  };
}

export interface FetchPlan {
  requests: DataRequest[];
}

export interface IDiffEngine {
  computeFetchPlan(intent: Intent): FetchPlan;
}

export interface HorizontalResult {
  windowIds: Array<string | null>;
  missingIntervals: Array<[number, number]>;
  needIdFetch: boolean;
}