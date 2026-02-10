import {IntentUnitBuilder} from "./builders";
import type {
  EntityKeys,
  ExtractEntity,
  ExtractIntentSource,
  ExtractUnitResult,
  IntentSource,
  IntentUnitsRecord,
  UnifiedConfig,
  UnitKeys
} from "@/types";

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
  attachEntityIntent<
    TTag extends string,
    KEntity extends EntityKeys<TConfig>
  >(tag: TTag extends UnitKeys<TUnits> ? never : TTag, entityKey: KEntity): IntentUnitBuilder<TConfig, TUnits, TTag, {
    type: "entity",
    key: KEntity
  }, ExtractEntity<TConfig, KEntity>> {
    return this.attach(tag, {type: "entity", key: entityKey});
  }
  
  /**
   * Attaches a new operation to an existing unit.
   * Creates an IntentBuilder starting from a previously defined unit.
   */
  attachUnitIntent<
    TTag extends string,
    KUnit extends UnitKeys<TUnits>
  >(tag: TTag extends UnitKeys<TUnits> ? never : TTag, unitTag: KUnit): IntentUnitBuilder<TConfig, TUnits, TTag, {
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
    TTag extends string,
    KSource extends IntentSource<TConfig, TUnits>
  >(tag: TTag extends UnitKeys<TUnits> ? never : TTag, sourceKey: KSource): IntentUnitBuilder<TConfig, TUnits, TTag, KSource, ExtractIntentSource<TConfig, TUnits, KSource>> {
    return new IntentUnitBuilder(sourceKey, tag, this.units);
  }
}