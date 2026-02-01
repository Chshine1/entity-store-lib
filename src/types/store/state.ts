import type {EntityConfig, ExtractEntity} from "../entity.ts";
import type {RelationConfig} from "../relation.ts";
import type {EntityOperationOptions} from "./common.ts";

/**
 * State structure for the entity store.
 */
export interface EntityStoreStateSlice<
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

export interface StateActionsSlice<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> {
  // State management
  load: <TEntityName extends keyof TEntities>(
    entityType: TEntityName,
    data: ExtractEntity<TEntities, TEntityName>,
    options?: EntityOperationOptions<TRelations>
  ) => boolean;
  
  clear: () => void;
  snapshot: () => EntityStoreStateSlice<TEntities, TRelations>;
  restore: (state: EntityStoreStateSlice<TEntities, TRelations>) => void;
}