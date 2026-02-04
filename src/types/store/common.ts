import type {RelationsRecord} from "../relation.ts";

/**
 * Options for entity creation and loading.
 */
export interface EntityOperationOptions<
  TRelations extends RelationsRecord
> {
  relationType?: keyof TRelations;
  sourceId?: string;
}

/**
 * Batch operation results with proper typing.
 */
export interface BatchResults<T> {
  successes: T[];
  failures: { data: any; error: Error }[];
}