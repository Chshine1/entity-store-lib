import type {
  ExtractRelation,
  IntentSource,
  IntentSourceAsEntityKey,
  IntentSourceFromEntityKey,
  IntentUnit,
  IntentUnitsRecord,
  SourcedRelations,
  UnifiedConfig
} from "@/types";

/**
 * Represents a SELECT operation in a query.
 * Specifies which fields to include in the result set.
 */
export type SelectOperation<
  TResult,
  K extends (keyof TResult)[]
> = {
  type: 'select';
  fields: K;
};

/**
 * Represents an INCLUDE operation in a query.
 * Specifies related entities to include in the result set.
 */
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