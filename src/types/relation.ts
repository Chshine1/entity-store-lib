import type {EntityConfig, ExtractEntity} from "./entity.ts";

/**
 * Configuration for a relation between entities.
 * @template TRelationName - Unique name for the relation.
 * @template TSourceName - Name of the source entity type.
 * @template TTargetName - Name of the target entity type.
 */
export interface RelationConfig<
  TRelationName extends string,
  TSourceName extends string,
  TTargetName extends string
> {
  name: TRelationName;
  sourceType: TSourceName;
  targetType: TTargetName;
}

/**
 * Resolves a relation to its source and target entity types.
 */
export type ResolvedRelation<
  TRelation extends RelationConfig<any, any, any>,
  TEntities extends Record<string, EntityConfig<any, any>>
> = TRelation extends RelationConfig<infer _, infer TSource, infer TTarget>
  ? {
    sourceType: TSource;
    targetType: TTarget;
    sourceEntity: ExtractEntity<TEntities, TSource>;
    targetEntity: ExtractEntity<TEntities, TTarget>;
  }
  : never;

/*
 * Extract relations whose source is the given entity.
 */
export type SourcedRelations<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>,
  TSource extends keyof TEntities
> = {
  [K in keyof TRelations]:
  ResolvedRelation<TRelations[K], TEntities>["sourceType"] extends TSource ?
    TRelations[K]
    : never;
}