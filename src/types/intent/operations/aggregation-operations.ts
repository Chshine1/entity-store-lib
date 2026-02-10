import type {AggregationType} from "@/types";

/**
 * Represents an AGGREGATE operation in a query.
 * Computes summary statistics on a specified field.
 */
export type AggregateOperation<
  TResult,
  K extends keyof TResult,
  TAggregation extends AggregationType
> = {
  type: 'aggregate';
  aggregation: TAggregation;
  field: K;
};