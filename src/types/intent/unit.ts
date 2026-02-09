import type {ExtractRelation, SourcedRelations, UnifiedConfig} from "../config.ts";
import type {AggregationType, QueryOperator, SortDirection} from "../core.ts";
import type {
  ExtractIntentSource,
  IntentSource,
  IntentSourceAsEntityKey,
  IntentSourceFromEntityKey
} from "../intent-source.ts";

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

export type WhereOperation<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  KSource extends IntentSource<TConfig, TUnits>,
  K extends keyof ExtractIntentSource<TConfig, TUnits, KSource>,
  V
> = {
  type: 'where';
  field: K;
  operator: QueryOperator;
  value: V | V[];
};

export type OrderByOperation<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  KSource extends IntentSource<TConfig, TUnits>,
  K extends keyof ExtractIntentSource<TConfig, TUnits, KSource>,
> = {
  type: 'orderBy';
  field: K;
  direction: SortDirection;
};

export type SkipOperation = {
  type: 'skip';
  count: number;
};

export type TakeOperation = {
  type: 'take';
  count: number;
};

export type SelectOperation<
  TResult,
  K extends (keyof TResult)[]
> = {
  type: 'select';
  fields: K;
};

export type IncludeOperation<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  KSource extends IntentSource<TConfig, TUnits>,
  KRelation extends keyof SourcedRelations<TConfig, IntentSourceAsEntityKey<TConfig, KSource>>,
  TSubResult
> = {
  type: 'include';
  relationKey: KRelation;
  subQuery: IntentUnit<TConfig, TUnits, IntentSourceFromEntityKey<TConfig, ExtractRelation<TConfig, KRelation>["targetKey"]>, TSubResult>;
};

export type AggregateOperation<
  TResult,
  K extends keyof TResult,
  TAggregation extends AggregationType
> = {
  type: 'aggregate';
  aggregation: TAggregation;
  field: K;
};

export type IntentUnit<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  KSource extends IntentSource<TConfig, TUnits>,
  TResult
> = {
  sourceKey: KSource;
  operations: Operation<TConfig, TUnits, KSource>[];
  result?: TResult;
};

export type IntentUnitsRecord = Record<string, IntentUnit<any, any, any, any>>;

export type UnitKeys<TUnits extends IntentUnitsRecord> = keyof TUnits;
export type ExtractUnitResult<
  TUnits extends IntentUnitsRecord,
  KUnit extends UnitKeys<TUnits>
> = TUnits[KUnit] extends IntentUnit<any, any, any, infer TResult>
  ? TResult
  : never;
  