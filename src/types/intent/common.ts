import type {IntentUnit} from "./unit.ts";
import type {EntitiesRecord} from "../entity.ts";
import type {RelationsRecord} from "../relation.ts";

export type Operation = 'where' | 'orderBy' | 'skip' | 'take' | 'select' | 'include' | 'aggregate';

export type QueryOperator =
  | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
  | 'in' | 'notIn' | 'contains' | 'startsWith' | 'endsWith'
  | 'isNull' | 'isNotNull';

export type SortDirection = 'asc' | 'desc';

export interface QueryCondition {
  field: string;
  operator: QueryOperator;
  value?: any;
  values?: any[];
}

export interface SortCondition {
  field: string;
  direction: SortDirection;
}

export interface IncludeConfig<TEntities extends EntitiesRecord, TRelations extends RelationsRecord> {
  relationKey: keyof TRelations;
  unit: IntentUnit<TEntities, TRelations, any>;
}

export interface AggregateConfig<T> {
  initialValue: T;
  accumulator: (current: T, item: any) => T;
}