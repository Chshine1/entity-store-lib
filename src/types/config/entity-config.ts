import type {BaseEntity} from "../core";

/**
 * Configuration for an entity type.
 * Defines the settings and defaults for a specific entity in the store.
 *
 * @template KEntity - The name of the entity type (must be unique).
 * @template TEntity - The entity type that extends BaseEntity.
 */
export interface EntityConfig<KEntity extends string, TEntity extends BaseEntity> {
  /** Unique identifier for the entity type */
  key: KEntity;
  /** Default values to apply when creating new instances of this entity */
  defaultValues?: Partial<Omit<TEntity, keyof BaseEntity>>;
  /** Function to generate unique IDs for this entity type */
  generateId?: () => string;
}