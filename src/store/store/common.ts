import type {RelationKeys, UnifiedConfig} from "../../types";

/**
 * Options for entity creation and loading.
 */
export interface EntityOperationOptions<
  TConfig extends UnifiedConfig
> {
  relationType?: RelationKeys<TConfig>;
  sourceId?: string;
}

/**
 * Batch operation results with proper typing.
 */
export interface BatchResults<T> {
  successes: T[];
  failures: { data: any; error: Error }[];
}