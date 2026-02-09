import type {EntityKeys, ExtractEntity, UnifiedConfig} from "./config.ts";
import type {IntentUnitsRecord} from "./intent";

export type IntentSource<TConfig extends UnifiedConfig, TUnits extends IntentUnitsRecord> =
  | { type: "entity", key: EntityKeys<TConfig> }
  | { type: "unit", key: keyof TUnits };

export type ExtractSource<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  TSource extends IntentSource<TConfig, TUnits>
> =
  TSource extends { type: "entity" }
    ? ExtractEntity<TConfig, TSource["key"]>
    : TSource extends { type: "unit" }
      ? TUnits[TSource["key"]]
      : never;