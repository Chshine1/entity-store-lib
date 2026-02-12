import type {BaseEntity} from "@/types";
import type {FilterAST} from "@/fractal-cache/core.ts";

export interface EntityRecord<T extends BaseEntity> {
  base: BaseEntity;
  data: Partial<Omit<T, keyof BaseEntity>>;
  fieldMask: Set<keyof Omit<T, keyof BaseEntity>>;
  relations: {
    [relationName: string]: string[];
  };
  meta: {
    lastAccess: number;
    version?: number;
    isOptimistic: boolean;
  };
}

export interface IEntityPool {
  getRecord<T extends BaseEntity>(type: string, id: string): EntityRecord<T> | undefined;
  
  updateRecord<T extends BaseEntity>(
    type: string,
    id: string,
    updater: (rec: EntityRecord<T>) => void
  ): void;
  
  getRecords<T extends BaseEntity>(type: string, ids: string[]): Array<EntityRecord<T> | undefined>;
  
  /** Find entity records (local filters) */
  findRecords<T extends BaseEntity>(type: string, filter: FilterAST): Array<EntityRecord<T>>;
  
  deleteRecord?(type: string, id: string): void;
}