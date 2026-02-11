import type {IntentSource, Operation, UnifiedConfig} from "@/types";

/**
 * Represents a unit of an intent (a query or operation).
 * Contains the source of the operation and a series of operations to perform.
 */
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

/**
 * Type representing a record of intent units.
 * Maps unit names to their corresponding IntentUnit definitions.
 */
export type IntentUnitsRecord = Record<string, IntentUnit<any, any, any, any>>;

export type UnitKeys<TUnits extends IntentUnitsRecord> = (keyof TUnits) & string;

/**
 * Extracts the result type from a unit in an IntentUnitsRecord.
 * Gets the TResult generic parameter from a specific intent unit.
 */
export type ExtractUnitResult<TUnits extends IntentUnitsRecord, KUnit extends UnitKeys<TUnits>> =
  TUnits[KUnit] extends IntentUnit<any, any, any, infer TResult>
    ? TResult
    : never;