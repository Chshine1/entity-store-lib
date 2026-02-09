/**
 * Base entity interface that all entities must extend.
 * Defines the common properties that every entity in the system should have.
 */
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Supported query operators for filtering operations.
 * These operators define how values are compared in WHERE clauses.
 */
export type QueryOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'notIn';

/**
 * Direction for sorting operations (ORDER BY clauses).
 * Specifies whether results should be ordered in ascending or descending order.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Types of aggregation operations supported by the system.
 * These operations can be applied to numeric fields to compute summary statistics.
 */
export type AggregationType = 'sum' | 'avg' | 'min' | 'max' | 'count';