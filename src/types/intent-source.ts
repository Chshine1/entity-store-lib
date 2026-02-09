import type {EntityKeys, ExtractEntity, UnifiedConfig} from "./config.ts";
import type {ExtractUnitResult, IntentUnitsRecord, UnitKeys} from "./intent";

export type IntentSource<TConfig extends UnifiedConfig, TUnits extends IntentUnitsRecord> =
  | { type: "entity", key: EntityKeys<TConfig> }
  | { type: "unit", key: UnitKeys<TUnits> };

export type IntentSourceAsEntityKey<
  TConfig extends UnifiedConfig,
  KSource extends IntentSource<TConfig, any>
> =
  KSource extends { type: "entity" }
    ? KSource["key"]
    : never;

export type IntentSourceFromEntityKey<TConfig extends UnifiedConfig, KEntity extends EntityKeys<TConfig>>
  = { type: "entity", key: KEntity };

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