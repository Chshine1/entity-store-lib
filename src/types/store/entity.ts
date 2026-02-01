import type {BaseEntity, EntityConfig, ExtractEntity} from "../entity.ts";
import type {RelationConfig} from "../relation.ts";
import type {EntityOperationOptions} from "./common.ts";

export interface EntityActionsSlice<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> {
  // Single entity operations
  create: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    data: Omit<ExtractEntity<TEntities, TEntityName>, keyof BaseEntity>,
    options?: EntityOperationOptions<TRelations>
  ) => ExtractEntity<TEntities, TEntityName>;
  
  update: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    id: string,
    data: Partial<Omit<ExtractEntity<TEntities, TEntityName>, keyof BaseEntity>>
  ) => ExtractEntity<TEntities, TEntityName> | undefined;
  
  remove: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    id: string
  ) => boolean;
  
  // Query operations
  get: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    id: string
  ) => ExtractEntity<TEntities, TEntityName> | undefined;
  
  getAll: <TEntityName extends keyof TEntities>(
    entityType: TEntityName
  ) => ExtractEntity<TEntities, TEntityName>[];
  
  find: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    predicate: (entity: ExtractEntity<TEntities, TEntityName>) => boolean
  ) => ExtractEntity<TEntities, TEntityName> | undefined;
  
  findAll: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    predicate: (entity: ExtractEntity<TEntities, TEntityName>) => boolean
  ) => ExtractEntity<TEntities, TEntityName>[];
}