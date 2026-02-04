/**
 * Base entity interface that all entities must extend.
 */
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type EntitiesRecord = Record<string, EntityConfig<any, any>>;

/**
 * Configuration for an entity type.
 * @template TName - The name of the entity type (must be unique).
 * @template TEntity - The entity type that extends BaseEntity.
 */
export interface EntityConfig<KEntity extends string, TEntity extends BaseEntity> {
  name: KEntity;
  defaultValues?: Partial<Omit<TEntity, keyof BaseEntity>>;
  generateId?: () => string;
}

/**
 * Extracts the entity type from a config record.
 */
export type ExtractEntity<
  TEntities extends EntitiesRecord,
  KEntity extends keyof TEntities
> = TEntities[KEntity] extends EntityConfig<any, infer TEntity> ? TEntity : never;