import type {IntentUnitsRecord} from "../intent-unit.ts";
import type {UnifiedConfig} from "../../config";
import type {IntentSource} from "../intent-source.ts";
import type {OrderByOperation, SkipOperation, TakeOperation, WhereOperation} from "./base-operations.ts";
import type {IncludeOperation, SelectOperation} from "./selection-operations.ts";
import type {AggregateOperation} from "./aggregation-operations.ts";

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
  | OrderByOperation<TConfig, TUnits, KSource, any>
  | SkipOperation
  | TakeOperation
  | SelectOperation<any, any>
  | IncludeOperation<TConfig, TUnits, KSource, any, any>
  | AggregateOperation<any, any, any>;