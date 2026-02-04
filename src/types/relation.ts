import type {EntitiesRecord, ExtractEntity} from "./entity.ts";

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

export type RelationsRecord = Record<string, RelationConfig<any, any, any>>;

/**
 * Resolves a relation to its source and target entity types.
 */
export type ResolveRelation<
  TEntities extends EntitiesRecord,
  TRelationConfig extends RelationConfig<any, any, any>
> = TRelationConfig extends RelationConfig<infer _, infer KSource, infer KTarget>
  ? {
    sourceType: KSource;
    targetType: KTarget;
    sourceEntity: ExtractEntity<TEntities, KSource>;
    targetEntity: ExtractEntity<TEntities, KTarget>;
  }
  : never;

/*
 * Extract relations whose source is the given entity.
 */
export type SourcedRelations<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  KSource extends keyof TEntities
> = {
  [K in keyof TRelations]:
  ResolveRelation<TEntities, TRelations[K]>["sourceType"] extends KSource ?
    TRelations[K]
    : never;
}