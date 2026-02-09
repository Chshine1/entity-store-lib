import type {IntentUnitsRecord} from "./unit.ts";
import {IntentBuilder} from "./builder.ts";
import type {EntityKeys, ExtractEntity, UnifiedConfig} from "../config.ts";
import type {ExtractSource, IntentSource} from "../source.ts";

export class Intent<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord
> {
  private readonly units: TUnits;
  
  public constructor(units: TUnits) {
    this.units = units;
  }
  
  attachToEntity<
    TTag extends Exclude<string, keyof TUnits>,
    KEntity extends EntityKeys<TConfig>
  >(tag: TTag, entityKey: KEntity): IntentBuilder<TConfig, TUnits, TTag, {
    type: "entity",
    key: KEntity
  }, ExtractEntity<TConfig, KEntity>> {
    return this.attach(tag, {type: "entity", key: entityKey});
  }
  
  attachToUnit<
    TTag extends Exclude<string, keyof TUnits>,
    KUnit extends keyof TUnits
  >(tag: TTag, unitTag: KUnit): IntentBuilder<TConfig, TUnits, TTag, {
    type: "unit",
    key: KUnit
  }, TUnits[KUnit]> {
    return this.attach(tag, {type: "unit", key: unitTag});
  }
  
  private attach<
    TTag extends Exclude<string, keyof TUnits>,
    KSource extends IntentSource<TConfig, TUnits>
  >(tag: TTag, sourceKey: KSource): IntentBuilder<TConfig, TUnits, TTag, KSource, ExtractSource<TConfig, TUnits, KSource>> {
    return new IntentBuilder(sourceKey, tag, this.units);
  }
}