import type {FilterAST, OrderSpec} from "@/fractal-cache/core.ts";

export interface NormalizedIntent<T = any> {
  entityType: string;
  select?: Set<keyof T & string>;
  where: FilterAST;
  orderBy: OrderSpec[];
  skip: number;
  take: number;
  include?: RelationIntent[];
}

export interface RelationIntent extends NormalizedIntent {
  relationName: string;
  /** true: inner join, false: left join, true by default */
  required?: boolean;
}