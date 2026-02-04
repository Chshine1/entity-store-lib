import type {RelationsRecord, ResolveRelation} from "../relation.ts";
import type {EntitiesRecord} from "../entity.ts";

export interface RelationActionsSlice<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord
> {
  // Relation operations
  relate: <KRelation extends keyof TRelations>(
    relationKey: KRelation,
    sourceId: string,
    targetId: string
  ) => void;
  
  unrelate: <KRelation extends keyof TRelations>(
    relationKey: KRelation,
    sourceId: string,
    targetId?: string // unrelate all if not specified
  ) => void;
  
  getRelated: <KRelation extends keyof TRelations>(
    relationKey: KRelation,
    sourceId: string
  ) => ResolveRelation<TEntities, TRelations[KRelation]>["targetEntity"][];
}