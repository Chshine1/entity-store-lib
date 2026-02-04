import type {BaseEntity} from "../entity.ts";

export type Primitive = string | number | boolean | null | undefined;
export type QueryOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'startsWith' | 'endsWith';

export interface WhereClause<T extends BaseEntity> {
  field: keyof T;
  operator: QueryOperator;
  value: Primitive | Primitive[];
}

export interface OrderByClause<T extends BaseEntity> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

export interface IntentConfig<T extends BaseEntity> {
  entity: string;
  where?: WhereClause<T>[];
  orderBy?: OrderByClause<T>[];
  skip?: number;
  take?: number;
  select?: (entity: T) => any;
  include?: Record<string, IntentConfig<any>>;
}