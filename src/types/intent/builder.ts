import type {QueryOperator} from "./common.ts";
import type {EntityConfig} from "../entity.ts";
import type {RelationConfig, ResolvedRelation, SourcedRelations} from "../relation.ts";
import type {IntentUnit} from "./unit.ts";
import type {IntentExpression} from "./expression.ts";

export interface IIntentBuilder<
  TUnit extends Record<string, IntentExpression<any>>,
  TTag extends string,
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>,
  KEntity extends keyof TEntities,
  R
> {
  where: <K extends keyof KEntity>(
    field: K,
    operator: QueryOperator,
    value: KEntity[K] | KEntity[K][]
  ) => IIntentBuilder<TUnit, TTag, TEntities, TRelations, KEntity, R>;
  
  orderBy: <K extends keyof KEntity>(
    field: K,
    direction: 'asc' | 'desc'
  ) => IIntentBuilder<TUnit, TTag, TEntities, TRelations, KEntity, R>;
  
  skip: (count: number) => IIntentBuilder<TUnit, TTag, TEntities, TRelations, KEntity, R>;
  
  take: (count: number) => IIntentBuilder<TUnit, TTag, TEntities, TRelations, KEntity, R>;
  
  select: <U>(selector: (data: R) => U) => IIntentBuilder<TUnit, TTag, TEntities, TRelations, KEntity, U>;
  
  include: <K extends keyof SourcedRelations<TEntities, TRelations, KEntity>, S>(
    relation: K,
    config: IIntentBuilder<TUnit, TTag, TEntities, TRelations, ResolvedRelation<TRelations[K], TEntities>["targetType"], S>
  ) => IIntentBuilder<TUnit, TTag, TEntities, TRelations, KEntity, R & S>;
  
  aggregate: <S>(initial: S, accumulate: (current: S, n: R) => S) => IIntentBuilder<TUnit, TTag, TEntities, TRelations, KEntity, S>;
  
  build: () => IntentUnit<KEntity & Record<TTag, IntentExpression<R[]>>, TEntities, TRelations>;
}