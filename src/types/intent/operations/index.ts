import type {
  AggregateOperation,
  IncludeOperation,
  IntentSource,
  IntentUnitsRecord,
  OrderByOperation,
  SelectOperation,
  SkipOperation,
  TakeOperation,
  UnifiedConfig,
  WhereOperation
} from "@/types";

export * from "./base-operations.ts";
export * from "./selection-operations.ts";
export * from "./aggregation-operations.ts";

/**
 * Union type representing all possible operations in an intent.
 * An operation can be any of the supported query operations.
 */
export type Operation<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  KSource extends IntentSource<TConfig, TUnits>
> =
  | WhereOperation<TConfig, TUnits, KSource, any, any>
  | OrderByOperation<any, any>
  | SkipOperation
  | TakeOperation
  | SelectOperation<any, any>
  | IncludeOperation<TConfig, TUnits, KSource, any, any>
  | AggregateOperation<any, any, any>;