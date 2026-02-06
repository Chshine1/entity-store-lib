import type {IntentUnitsRecord} from "./unit.ts";
import {IntentBuilder} from "./builder.ts";
import type {EntitiesRecord, ExtractEntity} from "../entity.ts";
import type {RelationsRecord} from "../relation.ts";

export class Intent<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  TUnits extends IntentUnitsRecord
> {
  private readonly units: TUnits;
  
  public constructor(units: TUnits) {
    this.units = units;
  }
  
  attach: <
    TTag extends string,
    KEntity extends keyof TEntities
  >(tag: TTag, entityKey: KEntity) => IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, ExtractEntity<TEntities, KEntity>>
    = (tag, entityKey) => new IntentBuilder(entityKey, tag, this.units);
}