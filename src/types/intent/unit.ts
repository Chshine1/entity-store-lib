import type {ExtractRelation, SourcedRelations, UnifiedConfig} from "../config.ts";
import type {AggregationType, QueryOperator, SortDirection} from "../core.ts";
import type {ExtractSource, IntentSource} from "../source.ts";

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
  | IncludeOperation<TConfig, TUnits, KSource, any>
  | AggregateOperation<any, any, any>;

export type WhereOperation<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  KSource extends IntentSource<TConfig, TUnits>,
  K extends keyof ExtractSource<TConfig, TUnits, KSource>,
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
  K extends keyof ExtractSource<TConfig, TUnits, KSource>,
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
  KRelation extends keyof SourcedRelations<TConfig, Extract<KSource, { type: "entity" }>["key"]>
> = {
  type: 'include';
  relationKey: KRelation;
  subQuery: IntentUnit<TConfig, TUnits, { type: "entity", key: ExtractRelation<TConfig, KRelation>["targetKey"] }>;
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
> = {
  sourceKey: KSource;
  operations: Operation<TConfig, TUnits, KSource>[];
};

export type IntentUnitsRecord = Record<string, IntentUnit<any, any, any>>;