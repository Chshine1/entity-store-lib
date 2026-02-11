import type {EntityConfig, RelationConfig} from "@/types";

/**
 * Combined configuration object that holds all entity and relation definitions.
 * This serves as the central configuration point for the entity store.
 */
export type UnifiedConfig = {
  /** Map of entity configurations indexed by entity name */
  entities: Record<string, EntityConfig<any, any>>;
  /** Map of relation configurations indexed by relation name */
  relations: Record<string, RelationConfig<any, any, any>>;
};

/**
 * Extracts the entity keys from a configuration object.
 * Used to get the available entity types from a config.
 */
export type EntityKeys<TConfig extends UnifiedConfig> = (keyof TConfig["entities"]) & string;

/**
 * Extracts the relation keys from a configuration object.
 * Used to get the available relation types from a config.
 */
export type RelationKeys<TConfig extends UnifiedConfig> = (keyof TConfig["relations"]) & string;

/**
 * Extracts the entity type for a given entity key from a configuration.
 * Maps an entity key to its corresponding entity type definition.
 */
export type ExtractEntity<TConfig extends UnifiedConfig, KEntity extends EntityKeys<TConfig>> =
  TConfig["entities"][KEntity] extends EntityConfig<any, infer TEntity>
    ? TEntity
    : never;

/**
 * Extracts the relation details for a given relation key from a configuration.
 * Provides information about the source and target entities of a relation.
 */
export type ExtractRelation<TConfig extends UnifiedConfig, KRelation extends RelationKeys<TConfig>> =
  TConfig["relations"][KRelation] extends RelationConfig<any, infer KSource, infer KTarget>
    ? {
      sourceKey: KSource;
      targetKey: KTarget;
      sourceType: ExtractEntity<TConfig, KSource>;
      targetType: ExtractEntity<TConfig, KTarget>;
    }
    : never;

/**
 * Extracts all relations that originate from a given entity.
 * This type maps all relations where the specified entity is the source.
 */
export type SourcedRelations<TConfig extends UnifiedConfig, KSource extends EntityKeys<TConfig>> = {
  [KR in RelationKeys<TConfig>]?:
  ExtractRelation<TConfig, KR>["sourceKey"] extends KSource
    ? TConfig["relations"][KR]
    : never;
};