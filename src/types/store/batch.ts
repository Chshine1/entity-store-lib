import type {BaseEntity, EntitiesRecord, ExtractEntity} from "../entity";
import type {BatchResults, EntityOperationOptions} from "./common.ts";
import type {RelationsRecord} from "../relation.ts";

/**
 * Main entity store interface.
 */
export interface BatchActionsSlice<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord
> {
  // Batch operations - now return detailed results
  createMany: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    data: Omit<ExtractEntity<TEntities, KEntity>, keyof BaseEntity>[],
    options?: EntityOperationOptions<TRelations>
  ) => BatchResults<ExtractEntity<TEntities, KEntity>>;
  
  updateMany: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    updates: {
      id: string;
      data: Partial<Omit<ExtractEntity<TEntities, KEntity>, keyof BaseEntity>>;
    }[]
  ) => BatchResults<ExtractEntity<TEntities, KEntity>>;
}