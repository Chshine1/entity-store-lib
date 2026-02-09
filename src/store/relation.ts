import type {ExtractRelation, RelationKeys, UnifiedConfig} from "../types";

export interface RelationActionsSlice<
  TConfig extends UnifiedConfig,
> {
  // Relation operations
  relate: <KRelation extends RelationKeys<TConfig>>(
    relationKey: KRelation,
    sourceId: string,
    targetId: string
  ) => void;
  
  unrelate: <KRelation extends RelationKeys<TConfig>>(
    relationKey: KRelation,
    sourceId: string,
    targetId?: string // unrelate all if not specified
  ) => void;
  
  getRelated: <KRelation extends RelationKeys<TConfig>>(
    relationKey: KRelation,
    sourceId: string
  ) => ExtractRelation<TConfig, KRelation>["targetEntityKey"][];
}