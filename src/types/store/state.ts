import type {EntityConfig, ExtractEntity} from "../entity.ts";
import type {RelationConfig} from "../relation.ts";
import type {EntityOperationOptions} from "./operation.ts";

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

export interface StateActions<
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
  snapshot: () => EntityStoreState<TEntities, TRelations>;
  restore: (state: EntityStoreState<TEntities, TRelations>) => void;
}