import type {AggregationType, QueryOperator, SortDirection,} from "../core";
import type {
  AggregateOperation,
  IncludeOperation,
  Operation,
  OrderByOperation,
  SelectOperation,
  SkipOperation,
  TakeOperation,
  WhereOperation
} from "./operations";
import {Intent} from "./intent-class.ts";
import type {ExtractRelation, SourcedRelations, UnifiedConfig} from "../config";
import type {
  ExtractIntentSource,
  IntentSource,
  IntentSourceAsEntityKey,
  IntentSourceFromEntityKey
} from "./intent-source.ts";
import type {IntentUnit, IntentUnitsRecord} from "./intent-unit.ts";

/**
 * Builder class for constructing intent operations.
 * Provides a fluent API for building complex queries step by step.
 */
export class IntentBuilder<
  TConfig extends UnifiedConfig,
  TUnits extends IntentUnitsRecord,
  TTag extends Exclude<string, keyof TUnits>,
  KSource extends IntentSource<TConfig, TUnits>,
  TResult
> {
  private operations: Operation<TConfig, TUnits, KSource>[] = [];
  private readonly sourceKey: KSource;
  private readonly tag: TTag;
  private readonly units: TUnits;
  
  public constructor(
    intentSource: KSource,
    tag: TTag,
    units: TUnits
  ) {
    this.sourceKey = intentSource;
    this.tag = tag;
    this.units = units;
  }
  
  /**
   * Adds a WHERE condition to the query.
   * Filters results based on a field and comparison operator.
   */
  where<K extends keyof ExtractIntentSource<TConfig, TUnits, KSource>>(
    field: K,
    operator: QueryOperator,
    value: ExtractIntentSource<TConfig, TUnits, KSource>[K],
  ): IntentBuilder<TConfig, TUnits, TTag, KSource, TResult> {
    const operation: WhereOperation<TConfig, TUnits, KSource, K, ExtractIntentSource<TConfig, TUnits, KSource>[K]> = {
      type: 'where',
      field: field,
      operator,
      value
    };
    this.operations.push(operation);
    return this;
  }
  
  /**
   * Adds an ORDER BY clause to the query.
   * Sorts results based on a field and direction.
   */
  orderBy<K extends keyof ExtractIntentSource<TConfig, TUnits, KSource>>(
    field: K,
    direction: SortDirection
  ): IntentBuilder<TConfig, TUnits, TTag, KSource, TResult> {
    const operation: OrderByOperation<TConfig, TUnits, KSource, K> = {
      type: 'orderBy',
      field: field,
      direction
    };
    this.operations.push(operation);
    return this;
  }
  
  /**
   * Adds a SKIP clause to the query.
   * Skips the specified number of results.
   */
  skip(count: number): IntentBuilder<TConfig, TUnits, TTag, KSource, TResult> {
    const operation: SkipOperation = {
      type: 'skip',
      count
    };
    this.operations.push(operation);
    return this;
  }
  
  /**
   * Adds a TAKE clause to the query.
   * Limits the number of results returned.
   */
  take(count: number): IntentBuilder<TConfig, TUnits, TTag, KSource, TResult> {
    const operation: TakeOperation = {
      type: 'take',
      count
    };
    this.operations.push(operation);
    return this;
  }
  
  /**
   * Adds a SELECT clause to the query.
   * Specifies which fields to include in the result.
   */
  select<K extends Array<keyof TResult>>(
    fields: [...K],
  ): IntentBuilder<TConfig, TUnits, TTag, KSource, Pick<TResult, K[number]>
  > {
    const operation: SelectOperation<TResult, K> = {
      type: 'select',
      fields
    };
    this.operations.push(operation);
    return this;
  }
  
  /**
   * Adds an INCLUDE clause to the query.
   * Includes related entities in the result.
   */
  include<
    KRelation extends keyof SourcedRelations<TConfig, IntentSourceAsEntityKey<TConfig, KSource>>,
    TSubTag extends string,
    TSubResult
  >(
    relationKey: KRelation,
    subQuery: IntentBuilder<
      TConfig,
      {},
      TSubTag,
      IntentSourceFromEntityKey<TConfig, ExtractRelation<TConfig, KRelation>["targetKey"]>,
      TSubResult>
  ): IntentBuilder<TConfig, TUnits, TTag, KSource, TResult & Record<TSubTag, TSubResult[]>> {
    const operation: IncludeOperation<TConfig, TUnits, KSource, KRelation, TSubResult> = {
      type: 'include',
      relationKey,
      subQuery: {
        sourceKey: subQuery.sourceKey,
        operations: [...subQuery.operations]
      }
    };
    this.operations.push(operation);
    return this;
  }
  
  /**
   * Adds an AGGREGATE operation to the query.
   * Computes summary statistics on a field.
   */
  aggregate<K extends keyof TResult, TAggregate extends AggregationType>(
    field: K,
    aggregation: TAggregate,
  ): IntentBuilder<TConfig, TUnits, TTag, KSource, TResult[K]> {
    const operation: AggregateOperation<TResult, K, TAggregate> = {
      type: 'aggregate',
      aggregation,
      field: field
    };
    this.operations.push(operation);
    return this;
  }
  
  /**
   * Builds the intent with the current operations.
   * Returns a new Intent instance with the configured operations.
   */
  build(): Intent<TConfig, TUnits & Record<TTag, IntentUnit<TConfig, TUnits, KSource, TResult>>> {
    const newUnit: IntentUnit<TConfig, TUnits, KSource, TResult> = {
      sourceKey: this.sourceKey,
      operations: this.operations,
    };
    
    const newUnits = {
      ...this.units,
      [this.tag]: newUnit
    };
    
    return new Intent(newUnits);
  }
}