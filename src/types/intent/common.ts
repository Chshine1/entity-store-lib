import type {IntentUnit} from "./unit.ts";
import type {EntitiesRecord, ExtractEntity} from "../entity.ts";
import type {RelationsRecord, ResolveRelation, SourcedRelations} from "../relation.ts";

export type QueryOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn';
export type SortDirection = 'asc' | 'desc';
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';

export type Operation<TEntities extends EntitiesRecord, TRelations extends RelationsRecord, KEntity extends keyof TEntities> =
  | WhereOperation<TEntities, KEntity, any, any>
  | OrderByOperation<TEntities, KEntity, any>
  | SkipOperation
  | TakeOperation
  | SelectOperation<any, any>
  | IncludeOperation<TEntities, TRelations, KEntity, any>
  | AggregateOperation<any, any, any>;

export type WhereOperation<
  TEntities extends EntitiesRecord,
  KEntity extends keyof TEntities,
  K extends keyof ExtractEntity<TEntities, KEntity>,
  V
> = {
  type: 'where';
  field: K;
  operator: QueryOperator;
  value: V | V[];
};

export type OrderByOperation<
  TEntities extends EntitiesRecord,
  KEntity extends keyof TEntities,
  K extends keyof ExtractEntity<TEntities, KEntity>
> = {
  type: 'orderBy';
  field: K;
  direction: SortDirection;
};

export type SkipOperation = {
  type: 'skip';
  count: number;
};

export type TakeOperation = {
  type: 'take';
  count: number;
};

export type SelectOperation<
  TResult,
  K extends Array<keyof TResult>
> = {
  type: 'select';
  fields: K;
};

export type IncludeOperation<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  KEntity extends keyof TEntities,
  KRelation extends keyof SourcedRelations<TEntities, TRelations, KEntity>
> = {
  type: 'include';
  relationKey: KRelation;
  subQuery: IntentUnit<TEntities, TRelations, ResolveRelation<TRelations, TRelations[KRelation]>["targetType"]>;
};

export type AggregateOperation<
  TResult,
  K extends keyof TResult,
  TAggregation extends AggregationType
> = {
  type: 'aggregate';
  aggregation: TAggregation;
  field: K;
};