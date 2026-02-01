import type {
  BaseEntity,
  EntityConfig,
  ExtractEntity,
  RelationConfig,
  EntityStoreStateSlice,
  StateActionsSlice,
  EntityStore
} from "../../types";


/**
 * Generator function to create an entity store
 */
export function createEntityStore<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
>(
  entitiesConfig: TEntities,
  relationsConfig: TRelations
): EntityStore<TEntities, TRelations> {
  // Initialize state
  const state: EntityStoreStateSlice<TEntities, TRelations> = {
    __entities: {} as any,
    __relations: {} as any
  };
  
  // Initialize entity maps
  for (const entityName in entitiesConfig) {
    state.__entities[entityName] = new Map<string, ExtractEntity<TEntities, typeof entityName>>();
  }
  
  // Initialize relation maps
  for (const relationName in relationsConfig) {
    state.__relations[relationName] = new Map<string, Set<string>>();
  }
  
  /**
   * Load an entity into the store
   */
  const load: StateActionsSlice<TEntities, TRelations>['load'] = (
    entityType,
    data,
    options
  ): boolean => {
    const entityMap = state.__entities[entityType];
    if (!entityMap) {
      console.error(`Entity type ${String(entityType)} not found in store`);
      return false;
    }
    
    // Use the provided data as-is, including its id, timestamps, etc.
    // No modifications are made to the entity data
    entityMap.set(data.id, data);
    return true;
  };
  
  /**
   * Clear all entities and relations from the store
   */
  const clear = (): void => {
    // Clear all entity maps
    for (const entityName in state.__entities) {
      state.__entities[entityName].clear();
    }
    
    // Clear all relation maps
    for (const relationName in state.__relations) {
      state.__relations[relationName].clear();
    }
  };
  
  /**
   * Create a deep copy snapshot of the current state
   */
  const snapshot = (): EntityStoreStateSlice<TEntities, TRelations> => {
    // Deep copy entities
    const entitiesSnapshot: any = {};
    for (const entityName in state.__entities) {
      const entityMap = state.__entities[entityName];
      const newMap = new Map<string, ExtractEntity<TEntities, typeof entityName>>();
      
      for (const [id, entity] of entityMap) {
        // Deep copy the entity object
        const entityCopy = { ...entity };
        // Handle Date objects for timestamps
        if (entityCopy.createdAt) {
          entityCopy.createdAt = new Date(entityCopy.createdAt);
        }
        if (entityCopy.updatedAt) {
          entityCopy.updatedAt = new Date(entityCopy.updatedAt);
        }
        newMap.set(id, entityCopy);
      }
      
      entitiesSnapshot[entityName] = newMap;
    }
    
    // Deep copy relations
    const relationsSnapshot: any = {};
    for (const relationName in state.__relations) {
      const relationMap = state.__relations[relationName];
      const newMap = new Map<string, Set<string>>();
      
      for (const [sourceId, targetIds] of relationMap) {
        newMap.set(sourceId, new Set(targetIds));
      }
      
      relationsSnapshot[relationName] = newMap;
    }
    
    return {
      __entities: entitiesSnapshot,
      __relations: relationsSnapshot
    };
  };
  
  /**
   * Restore state from a snapshot
   */
  const restore = (snapshotState: EntityStoreStateSlice<TEntities, TRelations>): void => {
    // Clear existing state
    clear();
    
    // Restore entities
    for (const entityName in snapshotState.__entities) {
      const snapshotMap = snapshotState.__entities[entityName];
      const entityMap = state.__entities[entityName];
      
      if (entityMap) {
        for (const [id, entity] of snapshotMap) {
          // Deep copy the entity
          const entityCopy = { ...entity };
          // Handle Date objects for timestamps
          if (entityCopy.createdAt) {
            entityCopy.createdAt = new Date(entityCopy.createdAt);
          }
          if (entityCopy.updatedAt) {
            entityCopy.updatedAt = new Date(entityCopy.updatedAt);
          }
          entityMap.set(id, entityCopy);
        }
      }
    }
    
    // Restore relations
    for (const relationName in snapshotState.__relations) {
      const snapshotMap = snapshotState.__relations[relationName];
      const relationMap = state.__relations[relationName];
      
      if (relationMap) {
        for (const [sourceId, targetIds] of snapshotMap) {
          relationMap.set(sourceId, new Set(targetIds));
        }
      }
    }
  };
  
  // Create the store object with all required slices
  const store = {
    // EntityStoreStateSlice
    __entities: state.__entities,
    __relations: state.__relations,
    
    // StateActionsSlice
    load,
    clear,
    snapshot,
    restore,
    
    // Placeholder implementations for other slices (to be implemented later)
    // EntityActionsSlice
    create: (() => { throw new Error('Not implemented'); }) as any,
    update: (() => { throw new Error('Not implemented'); }) as any,
    delete: (() => { throw new Error('Not implemented'); }) as any,
    
    // RelationActionsSlice
    addRelation: (() => { throw new Error('Not implemented'); }) as any,
    removeRelation: (() => { throw new Error('Not implemented'); }) as any,
    getRelated: (() => { throw new Error('Not implemented'); }) as any,
    
    // BatchActionsSlice
    batch: (() => { throw new Error('Not implemented'); }) as any,
    commitBatch: (() => { throw new Error('Not implemented'); }) as any,
    rollbackBatch: (() => { throw new Error('Not implemented'); }) as any,
  } as EntityStore<TEntities, TRelations>;
  
  return store;
}

// Export utility types and functions
export type {
  BaseEntity,
  EntityConfig,
  ExtractEntity,
  RelationConfig,
  EntityStoreStateSlice,
  StateActionsSlice,
  EntityStore
};

/**
 * Utility function to create entity configs in a type-safe way
 */
export function defineEntity<TName extends string, TEntity extends BaseEntity>(
  config: EntityConfig<TName, TEntity>
): EntityConfig<TName, TEntity> {
  return config;
}

/**
 * Utility function to create relation configs in a type-safe way
 */
export function defineRelation<
  TRelationName extends string,
  TSourceName extends string,
  TTargetName extends string
>(
  config: RelationConfig<TRelationName, TSourceName, TTargetName>
): RelationConfig<TRelationName, TSourceName, TTargetName> {
  return config;
}