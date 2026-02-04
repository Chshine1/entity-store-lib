import type {EntityStoreStateSlice, StateActionsSlice} from "./state.ts";
import type {EntityActionsSlice} from "./entity.ts";
import type {RelationActionsSlice} from "./relation.ts";
import type {BatchActionsSlice} from "./batch.ts";
import type {EntitiesRecord} from "../entity.ts";
import type {RelationsRecord} from "../relation.ts";

export * from "./batch.ts";
export * from "./entity.ts";
export * from "./common.ts";
export * from "./relation.ts";
export * from "./state.ts";

export type EntityStore<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord
> = EntityStoreStateSlice<TEntities, TRelations>
  & StateActionsSlice<TEntities, TRelations>
  & EntityActionsSlice<TEntities, TRelations>
  & RelationActionsSlice<TEntities, TRelations>
  & BatchActionsSlice<TEntities, TRelations>