import type {EntitiesRecord} from "../entity.ts";
import type {RelationsRecord} from "../relation.ts";
import type {
  AggregateConfig,
  IncludeConfig,
  QueryCondition,
  Operation,
  SortCondition
} from "./common.ts";

export interface IntentUnit<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  TResult
> {
  entityKey: keyof TEntities;
  
  where?: QueryCondition[];
  
  orderBy?: SortCondition[];
  
  skip?: number;
  take?: number;
  
  selector?: {
    fields?: string[];
    transform?: (data: any) => TResult;
  };
  
  includes?: Map<string, IncludeConfig<TEntities, TRelations>>;
  
  aggregation?: AggregateConfig<TResult>;
  
  chain?: {
    previous?: IntentUnit<TEntities, TRelations, any>;
    operation: Operation;
    data: any;
  };
}

export type IntentUnitsRecord = Record<string, IntentUnit<any, any, any>>;