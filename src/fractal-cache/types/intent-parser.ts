import type {FilterAST, OrderSpec} from "@/fractal-cache/core.ts";

export interface Intent<T = any> {
  entityType: string;
  select?: Set<keyof T & string>;
  where: FilterAST;
  orderBy: OrderSpec[];
  skip: number;
  take: number;
  include?: RelationIntent[];
}

export interface RelationIntent extends Intent {
  relationName: string;
  /** true: inner join, false: left join, true by default */
  required?: boolean;
}

export interface NormalizedIntent<T = any> extends Intent<T> {
  sortHash: string;
  filterHash: string;
}

export interface IIntentParser {
  normalizeIntent<T>(intent: Intent<T>): NormalizedIntent<T>;
  
  computeSortHash(orderBy: OrderSpec[]): string;
  
  computeFilterHash(where: FilterAST): string;
}