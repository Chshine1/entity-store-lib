import type {BaseEntity} from "./core.ts";

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
 * Configuration for a relation between entities.
 * @template TRelationName - Unique name for the relation.
 * @template TSourceName - Name of the source entity type.
 * @template TTargetName - Name of the target entity type.
 */
export interface RelationConfig<
  KRelation extends string,
  KSource extends string,
  KTarget extends string
> {
  name: KRelation;
  sourceType: KSource;
  targetType: KTarget;
}

export type UnifiedConfig = {
  entities: Record<string, EntityConfig<any, any>>;
  relations: Record<string, RelationConfig<any, any, any>>;
};

export type EntityKeys<TConfig extends UnifiedConfig> = keyof TConfig["entities"];
export type RelationKeys<TConfig extends UnifiedConfig> = keyof TConfig["relations"];

export type ExtractEntity<TConfig extends UnifiedConfig, KEntity extends EntityKeys<TConfig>> =
  TConfig["entities"][KEntity] extends EntityConfig<any, infer TEntity>
    ? TEntity
    : never;
export type ExtractRelation<TConfig extends UnifiedConfig, KRelation extends RelationKeys<TConfig>> =
  TConfig["relations"][KRelation] extends RelationConfig<any, infer KSource, infer KTarget>
    ? {
      sourceKey: KSource;
      targetKey: KTarget;
      sourceType: ExtractEntity<TConfig, KSource>;
      targetType: ExtractEntity<TConfig, KTarget>;
    }
    : never;

/*
 * Extract relations whose source is the given entity.
 */
export type SourcedRelations<TConfig extends UnifiedConfig, KSource extends EntityKeys<TConfig>> = {
  [KR in RelationKeys<TConfig>]?:
  ExtractRelation<TConfig, KR>["sourceKey"] extends KSource
    ? TConfig["relations"][KR]
    : never;
}