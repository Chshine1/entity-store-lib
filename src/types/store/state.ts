import type {EntitiesRecord, ExtractEntity} from "../entity.ts";
import type {EntityOperationOptions} from "./common.ts";
import type {RelationsRecord} from "../relation.ts";
import {IntentBuilder} from "../intent";

export interface EntityStoreStateSlice<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord
> {
  __entities: {
    [K in keyof TEntities]: Map<string, ExtractEntity<TEntities, K>>;
  };
  __relations: {
    [K in keyof TRelations]: Map<string, Set<string>>;
  };
}

export interface StateActionsSlice<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord
> {
  load: <KEntity extends keyof TEntities>(
    entityKey: KEntity,
    data: ExtractEntity<TEntities, KEntity>,
    options?: EntityOperationOptions<TRelations>
  ) => boolean;
  
  clear: () => void;
  snapshot: () => EntityStoreStateSlice<TEntities, TRelations>;
  restore: (state: EntityStoreStateSlice<TEntities, TRelations>) => void;
  
  intentBuilder: <
    TTag extends string,
    KEntity extends keyof TEntities
  >(tag: TTag) => IntentBuilder<TEntities, TRelations, {}, TTag, KEntity, KEntity>;
}