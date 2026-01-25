import type {EntityConfig} from "../entity.ts";
import type {RelationConfig} from "../relation.ts";

import type {EntityStoreState, StateActions} from "./state.ts";
import type {EntityActions} from "./entity.ts";
import type {RelationActions} from "./relation.ts";
import type {BatchActions} from "./batch.ts";

export * from "./batch";
export * from "./entity";
export * from "./operation";
export * from "./relation";
export * from "./state";

export type EntityStore<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> = EntityStoreState<TEntities, TRelations>
  & StateActions<TEntities, TRelations>
  & EntityActions<TEntities, TRelations>
  & RelationActions<TEntities, TRelations>
  & BatchActions<TEntities, TRelations>