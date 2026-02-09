import type {EntityKeys, ExtractEntity, UnifiedConfig} from "../config.ts";
import type {BaseEntity} from "../core.ts";
import type {EntityOperationOptions} from "./common.ts";


export interface EntityActionsSlice<
  TConfig extends UnifiedConfig,
> {
  create: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    data: Omit<ExtractEntity<TConfig, KEntity>, keyof BaseEntity>,
    options?: EntityOperationOptions<TConfig>
  ) => ExtractEntity<TConfig, KEntity>;
  
  update: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    id: string,
    data: Partial<Omit<ExtractEntity<TConfig, KEntity>, keyof BaseEntity>>
  ) => ExtractEntity<TConfig, KEntity> | undefined;
  
  remove: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    id: string
  ) => boolean;
  
  get: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    id: string
  ) => ExtractEntity<TConfig, KEntity> | undefined;
  
  getAll: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity
  ) => ExtractEntity<TConfig, KEntity>[];
  
  find: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    predicate: (entity: ExtractEntity<TConfig, KEntity>) => boolean
  ) => ExtractEntity<TConfig, KEntity> | undefined;
  
  findAll: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    predicate: (entity: ExtractEntity<TConfig, KEntity>) => boolean
  ) => ExtractEntity<TConfig, KEntity>[];
}