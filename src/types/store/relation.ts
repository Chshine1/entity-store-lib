import type {EntityConfig} from "../entity.ts";
import type {RelationConfig, ResolvedRelation} from "../relation.ts";

export interface RelationActionsSlice<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> {
  // Relation operations
  relate: <TRelationName extends keyof TRelations>(
    relationName: TRelationName,
    sourceId: string,
    targetId: string
  ) => void;
  
  unrelate: <TRelationName extends keyof TRelations>(
    relationName: TRelationName,
    sourceId: string,
    targetId?: string // unrelate all if not specified
  ) => void;
  
  getRelated: <TRelationName extends keyof TRelations>(
    relationName: TRelationName,
    sourceId: string
  ) => ResolvedRelation<TRelations[TRelationName], TEntities>["targetEntity"][];
}