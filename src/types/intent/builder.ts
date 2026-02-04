import type {QueryOperator} from "./common.ts";
import type {EntityConfig} from "../entity.ts";
import type {RelationConfig, ResolvedRelation, SourcedRelations} from "../relation.ts";

export interface IIntentBuilder<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>,
  T extends keyof TEntities,
  R
> {
  where: <K extends keyof T>(
    field: K,
    operator: QueryOperator,
    value: T[K] | T[K][]
  ) => IIntentBuilder<TEntities, TRelations, T, R>;
  
  orderBy: <K extends keyof T>(
    field: K,
    direction: 'asc' | 'desc'
  ) => IIntentBuilder<TEntities, TRelations, T, R>;
  
  skip: (count: number) => IIntentBuilder<TEntities, TRelations, T, R>;
  
  take: (count: number) => IIntentBuilder<TEntities, TRelations, T, R>;
  
  select: <U>(selector: (data: R) => U) => IIntentBuilder<TEntities, TRelations, T, U>;
  
  include: <K extends keyof SourcedRelations<TEntities, TRelations, T>, S>(
    relation: K,
    config: IIntentBuilder<TEntities, TRelations, ResolvedRelation<TRelations[K], TEntities>["targetType"], S>
  ) => IIntentBuilder<TEntities, TRelations, T, R & S>;
  
  // build: () => IntentUnit<T[], T[]>;
  //
  // attach<U extends BaseEntity, V>(
  //   tag: string,
  //   intent: IntentUnit<U, V> | ((data: T) => IntentUnit<U, V>)
  // ): ComposedIntent<T & Record<string, V>>;
}