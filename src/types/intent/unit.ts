import type {IntentUnitsRecord} from "./expression.ts";
import type {IntentBuilderBase} from "./builder.ts";
import type {EntitiesRecord, ExtractEntity} from "../entity.ts";
import type {RelationsRecord} from "../relation.ts";

export abstract class Intent<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  TUnits extends IntentUnitsRecord
> {
  protected readonly units: TUnits;
  
  protected constructor(units: TUnits) {
    this.units = units;
  }
  
  abstract attach<
    TTag extends string,
    KEntity extends keyof TEntities
  >(tag: TTag): IntentBuilderBase<TEntities, TRelations, TUnits, TTag, KEntity, ExtractEntity<TEntities, KEntity>>;
}