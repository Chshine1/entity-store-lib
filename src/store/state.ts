import type {EntityOperationOptions} from "./common.ts";
import type {IntentUnitBuilder, EntityKeys, ExtractEntity, RelationKeys, UnifiedConfig} from "../types";

export interface EntityStoreStateSlice<
  TConfig extends UnifiedConfig,
> {
  __entities: {
    [K in EntityKeys<TConfig>]: Map<string, ExtractEntity<TConfig, K>>;
  };
  __relations: {
    [K in RelationKeys<TConfig>]: Map<string, Set<string>>;
  };
}

export interface StateActionsSlice<
  TConfig extends UnifiedConfig,
> {
  load: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    data: ExtractEntity<TConfig, KEntity>,
    options?: EntityOperationOptions<TConfig>
  ) => boolean;
  
  clear: () => void;
  snapshot: () => EntityStoreStateSlice<TConfig>;
  restore: (state: EntityStoreStateSlice<TConfig>) => void;
  
  intentBuilder: <
    TTag extends string,
    KEntity extends EntityKeys<TConfig>
  >(tag: TTag) => IntentBuilder<TConfig, {}, TTag, { type: "entity", key: KEntity }, KEntity>;
}