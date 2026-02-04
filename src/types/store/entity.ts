import type {BaseEntity, EntitiesRecord, ExtractEntity} from "../entity.ts";
import type {EntityOperationOptions} from "./common.ts";
import type {RelationsRecord} from "../relation.ts";

export interface EntityActionsSlice<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord
> {
  create: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    data: Omit<ExtractEntity<TEntities, KEntity>, keyof BaseEntity>,
    options?: EntityOperationOptions<TRelations>
  ) => ExtractEntity<TEntities, KEntity>;
  
  update: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    id: string,
    data: Partial<Omit<ExtractEntity<TEntities, KEntity>, keyof BaseEntity>>
  ) => ExtractEntity<TEntities, KEntity> | undefined;
  
  remove: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    id: string
  ) => boolean;
  
  get: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    id: string
  ) => ExtractEntity<TEntities, KEntity> | undefined;
  
  getAll: <KEntity extends keyof TEntities>(
    entityKey: KEntity
  ) => ExtractEntity<TEntities, KEntity>[];
  
  find: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    predicate: (entity: ExtractEntity<TEntities, KEntity>) => boolean
  ) => ExtractEntity<TEntities, KEntity> | undefined;
  
  findAll: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    predicate: (entity: ExtractEntity<TEntities, KEntity>) => boolean
  ) => ExtractEntity<TEntities, KEntity>[];
}