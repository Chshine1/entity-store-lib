import type {QueryOperator} from "./common.ts";
import type {RelationsRecord, ResolveRelation, SourcedRelations} from "../relation.ts";
import type {Intent} from "./unit.ts";
import type {IntentUnitsRecord, IntentUnit} from "./expression.ts";
import type {EntitiesRecord} from "../entity.ts";

export abstract class IntentBuilderBase<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  TUnits extends IntentUnitsRecord,
  TTag extends string,
  KEntity extends keyof TEntities,
  R
> {
  protected readonly tag: TTag;
  protected readonly entityKey: KEntity;
  
  protected constructor(tag: TTag, entityKey: KEntity) {
    this.tag = tag;
    this.entityKey = entityKey;
  }
  
  abstract where: <K extends keyof KEntity>(
    field: K,
    operator: QueryOperator,
    value: KEntity[K] | KEntity[K][]
  ) => IntentBuilderBase<TEntities, TRelations, TUnits, TTag, KEntity, R>;
  
  abstract orderBy: <K extends keyof KEntity>(
    field: K,
    direction: 'asc' | 'desc'
  ) => IntentBuilderBase<TEntities, TRelations, TUnits, TTag, KEntity, R>;
  
  abstract skip: (count: number) => IntentBuilderBase<TEntities, TRelations, TUnits, TTag, KEntity, R>;
  
  abstract take: (count: number) => IntentBuilderBase<TEntities, TRelations, TUnits, TTag, KEntity, R>;
  
  abstract select: <U>(selector: (data: R) => U) => IntentBuilderBase<TEntities, TRelations, TUnits, TTag, KEntity, U>;
  
  abstract include: <K extends keyof SourcedRelations<TEntities, TRelations, KEntity>, S>(
    relation: K,
    config: IntentBuilderBase<TEntities, TRelations, TUnits, TTag, ResolveRelation<TEntities, TRelations[K]>["targetType"], S>
  ) => IntentBuilderBase<TEntities, TRelations, TUnits, TTag, KEntity, R & S>;
  
  abstract aggregate: <S>(initial: S, accumulate: (current: S, n: R) => S) => IntentBuilderBase<TEntities, TRelations, TUnits, TTag, KEntity, S>;
  
  abstract build: () => Intent<TEntities, TRelations, TUnits & Record<TTag, IntentUnit<R[]>>>;
}