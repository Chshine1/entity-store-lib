import type {EntityConfig} from "../entity.ts";
import type {RelationConfig} from "../relation.ts";

import type {EntityStoreStateSlice, StateActionsSlice} from "./state.ts";
import type {EntityActionsSlice} from "./entity.ts";
import type {RelationActionsSlice} from "./relation.ts";
import type {BatchActionsSlice} from "./batch.ts";

export * from "./batch.ts";
export * from "./entity.ts";
export * from "./common.ts";
export * from "./relation.ts";
export * from "./state.ts";

export type EntityStore<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> = EntityStoreStateSlice<TEntities, TRelations>
  & StateActionsSlice<TEntities, TRelations>
  & EntityActionsSlice<TEntities, TRelations>
  & RelationActionsSlice<TEntities, TRelations>
  & BatchActionsSlice<TEntities, TRelations>