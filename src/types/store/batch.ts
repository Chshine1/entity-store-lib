import type {BaseEntity, EntityConfig, ExtractEntity} from "../entity";
import type {RelationConfig} from "../relation";
import type {BatchResults, EntityOperationOptions} from "./operation.ts";

/**
 * Main entity store interface.
 */
export interface BatchActions<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> {
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
}