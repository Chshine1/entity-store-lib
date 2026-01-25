import type {EntityConfigMap} from "./entity.ts";

export interface RelationConfig<
  TEntities extends EntityConfigMap<any>,
  TSource extends keyof TEntities,
  TTarget extends keyof TEntities,
> {
  name: string;
  sourceType: TSource;
  targetType: TTarget;
}

export type RelationConfigMap<
  TConfigs extends Record<string, RelationConfig<TEntities, any, any>>,
  TEntities extends EntityConfigMap<any>
> = {
  [K in keyof TConfigs]: Extract<
    TConfigs[K],
    { name: K }
  > extends RelationConfig<any, any, any>
    ? TConfigs[K]
    : never;
};