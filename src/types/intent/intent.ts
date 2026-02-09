import type {IntentUnitsRecord} from "./unit.ts";
import {IntentBuilder} from "./builder.ts";
import type {UnifiedConfig} from "../config.ts";
import type {ExtractSource, IntentSource} from "../source.ts";

export class Intent<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord
> {
  private readonly units: TUnits;
  
  public constructor(units: TUnits) {
    this.units = units;
  }
  
  attach: <
    TTag extends Exclude<string, keyof TUnits>,
    KSource extends IntentSource<TConfig, TUnits>
  >(tag: TTag, sourceKey: KSource) => IntentBuilder<TConfig, TUnits, TTag, KSource, ExtractSource<TConfig, TUnits, KSource>>
    = (tag, sourceKey) => new IntentBuilder(sourceKey, tag, this.units);
}