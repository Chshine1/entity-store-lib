import type {BaseEntity, EntityConfig, ExtractEntity} from "./entity";
import type {RelationConfig, ResolvedRelation} from "./relation";

/**
 * State structure for the entity store.
 */
export interface EntityStoreState<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> {
  __entities: {
    [K in keyof TEntities]: Map<string, ExtractEntity<TEntities, K>>;
  };
  __relations: {
    [K in keyof TRelations]: Map<string, Set<string>>;
  };
}

/**
 * Main entity store interface.
 */
export interface EntityStore<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> {
  // Single entity operations
  load: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    data: ExtractEntity<TEntities, TEntityName>,
    options?: EntityOperationOptions<TRelations>
  ) => boolean;
  
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
  
  // Relation operations
  relate: <TRelationName extends keyof TRelations>(
    relationName: TRelationName,
    sourceId: string,
    targetId: string
  ) => void;
  
  unrelate: <TRelationName extends keyof TRelations>(
    relationName: TRelationName,
    sourceId: string,
    targetId?: string // unrelate all if not specified
  ) => void;
  
  getRelated: <TRelationName extends keyof TRelations>(
    relationName: TRelationName,
    sourceId: string
  ) => ResolvedRelation<TRelations[TRelationName], TEntities>["targetEntity"][];
  
  // Batch operations - now return detailed results
  createMany: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    data: Omit<ExtractEntity<TEntities, TEntityName>, keyof BaseEntity>[],
    options?: EntityOperationOptions<TRelations>
  ) => BatchResults<ExtractEntity<TEntities, TEntityName>>;
  
  updateMany: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    updates: {
      id: string;
      data: Partial<Omit<ExtractEntity<TEntities, TEntityName>, keyof BaseEntity>>;
    }[]
  ) => BatchResults<ExtractEntity<TEntities, TEntityName>>;
  
  // State management
  clear: () => void;
  snapshot: () => EntityStoreState<TEntities, TRelations>;
  restore: (state: EntityStoreState<TEntities, TRelations>) => void;
}

/**
 * Options for entity creation and loading.
 */
export interface EntityOperationOptions<
  TRelations extends Record<string, RelationConfig<any, any, any>>
> {
  relationType?: keyof TRelations;
  sourceId?: string;
}

/**
 * Batch operation results with proper typing.
 */
export interface BatchResults<T> {
  successes: T[];
  failures: { data: any; error: Error }[];
}