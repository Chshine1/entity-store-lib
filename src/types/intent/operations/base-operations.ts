import type {
  ExtractIntentSource,
  IntentSource,
  IntentUnitsRecord,
  QueryOperator,
  SortDirection,
  UnifiedConfig
} from "@/types";

/**
 * Represents a WHERE operation in a query.
 * Filters records based on a field condition.
 */
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

/**
 * Represents an ORDER BY operation in a query.
 * Sorts records based on a field and direction.
 */
export type OrderByOperation<
  TResult,
  K extends keyof TResult,
> = {
  type: 'orderBy';
  field: K;
  direction: SortDirection;
};

/**
 * Represents a SKIP operation in a query.
 * Skips a specified number of records from the result set.
 */
export type SkipOperation = {
  type: 'skip';
  count: number;
};

/**
 * Represents a TAKE operation in a query.
 * Limits the number of records returned from the result set.
 */
export type TakeOperation = {
  type: 'take';
  count: number;
};