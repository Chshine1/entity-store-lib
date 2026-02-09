import type {ExtractUnitResult, IntentUnitsRecord, UnitKeys} from "./intent-unit.ts";
import {IntentBuilder} from "./intent-builder.ts";
import type {EntityKeys, ExtractEntity, UnifiedConfig} from "../config";
import type {ExtractIntentSource, IntentSource} from "./intent-source.ts";

/**
 * Main Intent class that manages and builds complex queries.
 * Provides methods to attach operations to entities or other units.
 */
export class Intent<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord
> {
  private readonly units: TUnits;
  
  public constructor(units: TUnits) {
    this.units = units;
  }
  
  /**
   * Attaches a new operation to an entity.
   * Creates an IntentBuilder starting from a specific entity.
   */
  attachToEntity<
    TTag extends Exclude<string, UnitKeys<TUnits>>,
    KEntity extends EntityKeys<TConfig>
  >(tag: TTag, entityKey: KEntity): IntentBuilder<TConfig, TUnits, TTag, {
    type: "entity",
    key: KEntity
  }, ExtractEntity<TConfig, KEntity>> {
    return this.attach(tag, {type: "entity", key: entityKey});
  }
  
  /**
   * Attaches a new operation to an existing unit.
   * Creates an IntentBuilder starting from a previously defined unit.
   */
  attachToUnit<
    TTag extends Exclude<string, UnitKeys<TUnits>>,
    KUnit extends UnitKeys<TUnits>
  >(tag: TTag, unitTag: KUnit): IntentBuilder<TConfig, TUnits, TTag, {
    type: "unit",
    key: KUnit
  }, ExtractUnitResult<TUnits, KUnit>> {
    return this.attach(tag, {type: "unit", key: unitTag});
  }
  
  /**
   * Private method to attach an operation to a source.
   * Internal helper for creating IntentBuilders.
   */
  private attach<
    TTag extends Exclude<string, keyof TUnits>,
    KSource extends IntentSource<TConfig, TUnits>
  >(tag: TTag, sourceKey: KSource): IntentBuilder<TConfig, TUnits, TTag, KSource, ExtractIntentSource<TConfig, TUnits, KSource>> {
    return new IntentBuilder(sourceKey, tag, this.units);
  }
}