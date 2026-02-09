import type {
  AggregationType,
  QueryOperator,
  SortDirection,
} from "../core.ts";
import type {
  AggregateOperation,
  IncludeOperation,
  IntentUnit,
  IntentUnitsRecord,
  Operation,
  OrderByOperation, SelectOperation,
  SkipOperation, TakeOperation,
  WhereOperation
} from "./unit.ts";
import {Intent} from "./intent.ts";
import type {ExtractRelation, SourcedRelations, UnifiedConfig} from "../config.ts";
import type {IntentSourceAsEntityKey, ExtractIntentSource, IntentSourceFromEntityKey, IntentSource} from "../intent-source.ts";

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
  
  skip(count: number): IntentBuilder<TConfig, TUnits, TTag, KSource, TResult> {
    const operation: SkipOperation = {
      type: 'skip',
      count
    };
    this.operations.push(operation);
    return this;
  }
  
  take(count: number): IntentBuilder<TConfig, TUnits, TTag, KSource, TResult> {
    const operation: TakeOperation = {
      type: 'take',
      count
    };
    this.operations.push(operation);
    return this;
  }
  
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