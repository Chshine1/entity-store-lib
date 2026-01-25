/**
 * Base entity interface that all entities must extend.
 */
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Configuration for an entity type.
 * @template TName - The name of the entity type (must be unique).
 * @template TEntity - The entity type that extends BaseEntity.
 */
export interface EntityConfig<TName extends string, TEntity extends BaseEntity> {
  name: TName;
  defaultValues?: Partial<Omit<TEntity, keyof BaseEntity>>;
  generateId?: () => string;
}

/**
 * Extracts the entity type from a config record.
 */
export type ExtractEntity<
  TConfigs extends Record<string, EntityConfig<any, any>>,
  TKey extends keyof TConfigs
> = TConfigs[TKey] extends EntityConfig<any, infer TEntity> ? TEntity : never;