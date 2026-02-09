import type {EntityStoreStateSlice, StateActionsSlice} from "./state.ts";
import type {EntityActionsSlice} from "./entity.ts";
import type {RelationActionsSlice} from "./relation.ts";
import type {BatchActionsSlice} from "./batch.ts";
import type {UnifiedConfig} from "../../types";

export * from "./batch.ts";
export * from "./entity.ts";
export * from "./common.ts";
export * from "./relation.ts";
export * from "./state.ts";

export type EntityStore<
  TConfig extends UnifiedConfig,
> = EntityStoreStateSlice<TConfig>
  & StateActionsSlice<TConfig>
  & EntityActionsSlice<TConfig>
  & RelationActionsSlice<TConfig>
  & BatchActionsSlice<TConfig>