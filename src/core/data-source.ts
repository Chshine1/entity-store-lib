import {create} from "zustand";
import type {BaseEntity, EntityStoreConfig, RelationConfig, RelationMap, StoreState} from "../types";

function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as T;
  if (obj instanceof Map) return new Map(obj) as T;
  if (obj instanceof Set) return new Set(obj) as T;
  
  const cloned = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      (cloned as any)[key] = deepClone((obj as any)[key]);
    }
  }
  
  return cloned as T;
}

export function createEntityStore<
  TEntities extends Record<string, BaseEntity>,
  TRelations extends RelationConfig<any, any>[] = [],
  TRelationMap extends RelationMap<TEntities, TRelations> = RelationMap<TEntities, TRelations>
>(config: EntityStoreConfig<TEntities, TRelations>) {
  
  const initialState: StoreState<TEntities, TRelationMap> = {
    entities: {} as any,
    relations: new Map(),
  };
  
  Object.keys(config.entities).forEach((entityType) => {
    (initialState.entities as any)[entityType] = {
      byId: new Map(),
    };
  });
  
  if (config.relations) {
    config.relations.forEach((relation) => {
      initialState.relations.set(relation.name, new Map());
    });
  }
  
  // 创建存储
  return create<ReturnType<typeof createStoreActions>>((set, get) => {
    const actions = createStoreActions(set, get);
    return actions;
  });
  
  function createStoreActions(
    set: (fn: (state: StoreState<TEntities, TRelationMap>) => StoreState<TEntities, TRelationMap>) => void,
    get: () => StoreState<TEntities, TRelationMap>
  ) {
    // ========== 实体操作 ==========
    
    const load = <K extends keyof TEntities>(
      entityType: K,
      data: TEntities[K]
    ): boolean => {
      set((state) => {
        const newEntities = { ...state.entities };
        const entityStore = newEntities[entityType];
        const newById = new Map(entityStore.byId);
        
        newById.set(data.id, {
          ...data,
          updatedAt: new Date(),
        });
        
        newEntities[entityType] = {
          ...entityStore,
          byId: newById,
        };
        
        return {
          ...state,
          entities: newEntities,
        };
      });
      
      return true;
    };
    
    const create = <K extends keyof TEntities>(
      entityType: K,
      data: Omit<TEntities[K], keyof BaseEntity>
    ): TEntities[K] => {
      const entityConfig = config.entities[entityType];
      const now = new Date();
      const id = entityConfig.generateId ? entityConfig.generateId() :
        `entity_${entityType as string}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newEntity: TEntities[K] = {
        ...entityConfig.defaultValues,
        ...data,
        id,
        createdAt: now,
        updatedAt: now,
      } as TEntities[K];
      
      set((state) => {
        const newEntities = { ...state.entities };
        const entityStore = newEntities[entityType];
        const newById = new Map(entityStore.byId);
        
        newById.set(id, newEntity);
        
        newEntities[entityType] = {
          ...entityStore,
          byId: newById,
        };
        
        return {
          ...state,
          entities: newEntities,
        };
      });
      
      return newEntity;
    };
    
    const update = <K extends keyof TEntities>(
      entityType: K,
      id: string,
      data: Partial<Omit<TEntities[K], keyof BaseEntity>>
    ): TEntities[K] | undefined => {
      const state = get();
      const entity = state.entities[entityType]?.byId.get(id);
      
      if (!entity) return undefined;
      
      const updatedEntity = {
        ...entity,
        ...data,
        updatedAt: new Date(),
      };
      
      set((state) => {
        const newEntities = { ...state.entities };
        const entityStore = newEntities[entityType];
        const newById = new Map(entityStore.byId);
        
        newById.set(id, updatedEntity);
        
        newEntities[entityType] = {
          ...entityStore,
          byId: newById,
        };
        
        return {
          ...state,
          entities: newEntities,
        };
      });
      
      return updatedEntity;
    };
    
    const remove = <K extends keyof TEntities>(
      entityType: K,
      id: string
    ): boolean => {
      const state = get();
      const entityExists = state.entities[entityType]?.byId.has(id);
      
      if (!entityExists) return false;
      
      set((state) => {
        // 清理实体
        const newEntities = { ...state.entities };
        const entityStore = newEntities[entityType];
        const newById = new Map(entityStore.byId);
        newById.delete(id);
        
        newEntities[entityType] = {
          ...entityStore,
          byId: newById,
        };
        
        // 清理相关的关系
        const newRelations = new Map(state.relations);
        newRelations.forEach((relationMap) => {
          relationMap.delete(id);
        });
        
        return {
          ...state,
          entities: newEntities,
          relations: newRelations,
        };
      });
      
      return true;
    };
    
    const getEntity = <K extends keyof TEntities>(
      entityType: K,
      id: string
    ): TEntities[K] | undefined => {
      const state = get();
      return state.entities[entityType]?.byId.get(id);
    };
    
    const getAll = <K extends keyof TEntities>(
      entityType: K
    ): TEntities[K][] => {
      const state = get();
      const entityMap = state.entities[entityType]?.byId;
      return entityMap ? Array.from(entityMap.values()) : [];
    };
    
    const relate = <
      TRelationName extends keyof TRelationMap & string,
      TSource extends TRelationMap[TRelationName]['sourceType'],
      TTarget extends TRelationMap[TRelationName]['targetType']
    >(
      relationName: TRelationName,
      sourceType: TSource,
      sourceId: string,
      targetType: TTarget,
      targetId: string
    ): void => {
      set((state) => {
        const relationMap = state.relations.get(relationName as string);
        if (!relationMap) return state;
        
        const newRelations = new Map(state.relations);
        const newRelationMap = new Map(relationMap);
        const targetIds = newRelationMap.get(sourceId) || [];
        
        if (!targetIds.includes(targetId)) {
          const newTargetIds = [...targetIds, targetId];
          newRelationMap.set(sourceId, newTargetIds);
          newRelations.set(relationName as string, newRelationMap);
        }
        
        return {
          ...state,
          relations: newRelations,
        };
      });
    };
    
    const unrelate = <
      TRelationName extends keyof TRelationMap & string,
      TSource extends TRelationMap[TRelationName]['sourceType']
    >(
      relationName: TRelationName,
      sourceId: string,
      targetId?: string
    ): void => {
      set((state) => {
        const relationMap = state.relations.get(relationName as string);
        if (!relationMap) return state;
        
        const newRelations = new Map(state.relations);
        const newRelationMap = new Map(relationMap);
        
        if (targetId) {
          const targetIds = newRelationMap.get(sourceId);
          if (targetIds) {
            const newTargetIds = targetIds.filter(id => id !== targetId);
            if (newTargetIds.length === 0) {
              newRelationMap.delete(sourceId);
            } else {
              newRelationMap.set(sourceId, newTargetIds);
            }
          }
        } else {
          newRelationMap.delete(sourceId);
        }
        
        newRelations.set(relationName as string, newRelationMap);
        
        return {
          ...state,
          relations: newRelations,
        };
      });
    };
    
    const getRelated = <
      TRelationName extends keyof TRelationMap & string,
      TSource extends TRelationMap[TRelationName]['sourceType'],
      TTarget extends TRelationMap[TRelationName]['targetType']
    >(
      relationName: TRelationName,
      sourceId: string,
      targetType?: TTarget
    ): TEntities[TTarget][] => {
      const state = get();
      const relationMap = state.relations.get(relationName as string);
      const targetIds = relationMap?.get(sourceId) || [];
      
      if (targetType) {
        const entityStore = state.entities[targetType];
        return targetIds
          .map(id => entityStore?.byId.get(id))
          .filter(Boolean) as TEntities[TTarget][];
      }
      
      // 如果没有指定targetType，尝试从关系配置中推断
      const relationConfig = config.relations?.find(r => r.name === relationName);
      if (relationConfig) {
        const entityStore = state.entities[relationConfig.targetType as keyof TEntities];
        return targetIds
          .map(id => entityStore?.byId.get(id))
          .filter(Boolean) as TEntities[TTarget][];
      }
      
      return [];
    };
    
    // ========== 查询操作 ==========
    
    const findFirst = <K extends keyof TEntities>(
      entityType: K,
      predicate: (entity: TEntities[K]) => boolean
    ): TEntities[K] | undefined => {
      const state = get();
      const entityMap = state.entities[entityType]?.byId;
      if (!entityMap) return undefined;
      
      for (const entity of entityMap.values()) {
        if (predicate(entity)) {
          return entity;
        }
      }
      return undefined;
    };
    
    const findAll = <K extends keyof TEntities>(
      entityType: K,
      predicate: (entity: TEntities[K]) => boolean
    ): TEntities[K][] => {
      const state = get();
      const entityMap = state.entities[entityType]?.byId;
      if (!entityMap) return [];
      
      const result: TEntities[K][] = [];
      for (const entity of entityMap.values()) {
        if (predicate(entity)) {
          result.push(entity);
        }
      }
      return result;
    };
    
    // ========== 缓存操作 ==========
    
    const cache = {
      set: (key: string, data: any, ttl?: number): void => {
        if (!config.options?.enableCache) return;
        
        set((state) => {
          const newCache = new Map(state.cache);
          newCache.set(key, {
            data: deepClone(data),
            timestamp: Date.now(),
            ttl: ttl || config.options?.defaultCacheTTL,
          });
          
          return {
            ...state,
            cache: newCache,
          };
        });
      },
      
      get: <T = any>(key: string): T | undefined => {
        if (!config.options?.enableCache) return undefined;
        
        const state = get();
        const cacheItem = state.cache.get(key);
        
        if (!cacheItem) return undefined;
        
        // 检查是否过期
        const now = Date.now();
        if (cacheItem.ttl && now - cacheItem.timestamp > cacheItem.ttl) {
          // 异步清理过期缓存
          setTimeout(() => {
            const currentState = get();
            const newCache = new Map(currentState.cache);
            newCache.delete(key);
            set((state) => ({
              ...state,
              cache: newCache,
            }));
          }, 0);
          return undefined;
        }
        
        return deepClone(cacheItem.data);
      },
      
      remove: (key: string): void => {
        set((state) => {
          const newCache = new Map(state.cache);
          newCache.delete(key);
          
          return {
            ...state,
            cache: newCache,
          };
        });
      },
      
      clear: (): void => {
        set((state) => ({
          ...state,
          cache: new Map(),
        }));
      },
    };
    
    // ========== 批量操作 ==========
    
    const batch = {
      addMany: <K extends keyof TEntities>(
        entityType: K,
        items: Array<Omit<TEntities[K], 'id'> & { id?: string }>
      ): TEntities[K][] => {
        const entityConfig = config.entities[entityType];
        const now = new Date();
        const results: TEntities[K][] = [];
        
        set((state) => {
          const newEntities = { ...state.entities };
          const entityStore = newEntities[entityType];
          const newById = new Map(entityStore.byId);
          
          items.forEach((item) => {
            const id = item.id || (entityConfig.generateId ? entityConfig.generateId() :
              `entity_${entityType as string}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
            
            const newEntity: TEntities[K] = {
              ...entityConfig.defaultValues,
              ...item,
              id,
              createdAt: now,
              updatedAt: now,
            } as TEntities[K];
            
            newById.set(id, newEntity);
            results.push(newEntity);
          });
          
          newEntities[entityType] = {
            ...entityStore,
            byId: newById,
          };
          
          return {
            ...state,
            entities: newEntities,
          };
        });
        
        return results;
      },
      
      updateMany: <K extends keyof TEntities>(
        entityType: K,
        updates: Array<{ id: string; data: Partial<TEntities[K]> }>
      ): Array<TEntities[K] | undefined> => {
        const state = get();
        const results: Array<TEntities[K] | undefined> = [];
        
        set((state) => {
          const newEntities = { ...state.entities };
          const entityStore = newEntities[entityType];
          const newById = new Map(entityStore.byId);
          
          updates.forEach(({ id, data }) => {
            const entity = newById.get(id);
            if (entity) {
              const updatedEntity = {
                ...entity,
                ...data,
                updatedAt: new Date(),
              };
              newById.set(id, updatedEntity);
              results.push(updatedEntity);
            } else {
              results.push(undefined);
            }
          });
          
          newEntities[entityType] = {
            ...entityStore,
            byId: newById,
          };
          
          return {
            ...state,
            entities: newEntities,
          };
        });
        
        return results;
      },
    };
    
    // ========== 其他操作 ==========
    
    const clear = (): void => {
      set(() => deepClone(initialState));
    };
    
    const snapshot = (): StoreState<TEntities, TRelationMap> => {
      const state = get();
      return deepClone(state);
    };
    
    const restore = (snapshot: StoreState<TEntities, TRelationMap>): void => {
      set(() => deepClone(snapshot));
    };
    
    return {
      load,
      create,
      update,
      remove,
      get: getEntity,
      getAll,
      relate,
      unrelate,
      getRelated,
      findFirst,
      findAll,
      cache,
      batch,
      clear,
      snapshot,
      restore,
    };
  }
}