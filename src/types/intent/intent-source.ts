import type {EntityKeys, ExtractEntity, ExtractUnitResult, IntentUnitsRecord, UnifiedConfig, UnitKeys} from "@/types";

/**
 * Represents a source for an intent operation.
 * Can either be an entity or a previously defined unit.
 */
export type IntentSource<TConfig extends UnifiedConfig, TUnits extends IntentUnitsRecord> =
  | { type: "entity", key: EntityKeys<TConfig> }
  | { type: "unit", key: UnitKeys<TUnits> };

/**
 * Extracts the entity key from an intent source if it's of type "entity".
 * Returns never if the source is of type "unit".
 */
export type IntentSourceAsEntityKey<
  TConfig extends UnifiedConfig,
  KSource extends IntentSource<TConfig, any>
> =
  KSource extends { type: "entity" }
    ? KSource["key"]
    : never;

/**
 * Creates an intent source from an entity key.
 * Convenience type to construct an entity-based intent source.
 */
export type IntentSourceFromEntityKey<TConfig extends UnifiedConfig, KEntity extends EntityKeys<TConfig>>
  = { type: "entity", key: KEntity };

/**
 * Extracts the result type from an intent source.
 * Determines the actual type based on whether the source is an entity or a unit.
 */
export type ExtractIntentSource<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  KSource extends IntentSource<TConfig, TUnits>
> =
  KSource extends { type: "entity" }
    ? ExtractEntity<TConfig, KSource["key"]>
    : KSource extends { type: "unit" }
      ? ExtractUnitResult<TUnits, KSource["key"]>
      : never;