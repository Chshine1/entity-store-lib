import type {IntentExpression} from "./expression.ts";
import type {IIntentBuilder} from "./builder.ts";
import type {EntityConfig, ExtractEntity} from "../entity.ts";
import type {RelationConfig} from "../relation.ts";

export interface IntentUnit<
  T extends Record<string, IntentExpression<any>>,
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>,
> {
  expressions: T;
  
  attach<
    TTag extends string,
    KEntity extends keyof TEntities
  >(tag: TTag): IIntentBuilder<T, TTag, TEntities, TRelations, KEntity, ExtractEntity<TEntities, KEntity>>;
}