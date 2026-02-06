import type {
  AggregationType,
  QueryOperator,
  SortDirection,
} from "./common.ts";
import type {EntitiesRecord, ExtractEntity} from "../entity.ts";
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
import type {RelationsRecord, ResolveRelation} from "../relation.ts";
import {Intent} from "./intent.ts";

export class IntentBuilder<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  TUnits extends IntentUnitsRecord,
  TTag extends Exclude<string, keyof TUnits>,
  KEntity extends keyof TEntities,
  TResult
> {
  private operations: Operation<TEntities, TRelations, KEntity>[] = [];
  private readonly entityKey: KEntity;
  private readonly tag: TTag;
  private readonly units: TUnits;
  
  public constructor(
    entityKey: KEntity,
    tag: TTag,
    units: TUnits
  ) {
    this.entityKey = entityKey;
    this.tag = tag;
    this.units = units;
  }
  
  where<K extends keyof ExtractEntity<TEntities, KEntity>>(
    field: K,
    operator: QueryOperator,
    value: ExtractEntity<TEntities, KEntity>[K] | ExtractEntity<TEntities, KEntity>[K][]
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult> {
    const operation: WhereOperation<TEntities, KEntity, K, ExtractEntity<TEntities, KEntity>[K]> = {
      type: 'where',
      field: field,
      operator,
      value
    };
    this.operations.push(operation);
    return this;
  }
  
  orderBy<K extends keyof ExtractEntity<TEntities, KEntity>>(
    field: K,
    direction: SortDirection
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult> {
    const operation: OrderByOperation<TEntities, KEntity, K> = {
      type: 'orderBy',
      field: field,
      direction
    };
    this.operations.push(operation);
    return this;
  }
  
  skip(count: number): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult> {
    const operation: SkipOperation = {
      type: 'skip',
      count
    };
    this.operations.push(operation);
    return this;
  }
  
  take(count: number): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult> {
    const operation: TakeOperation = {
      type: 'take',
      count
    };
    this.operations.push(operation);
    return this;
  }
  
  select<K extends Array<keyof TResult>>(
    fields: [...K]
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, Pick<TResult, K[number]>
  > {
    const operation: SelectOperation<TResult, K> = {
      type: 'select',
      fields
    };
    this.operations.push(operation);
    return this;
  }
  
  include<
    KRelation extends keyof TRelations,
    TSubTag extends string,
    TSubResult
  >(
    relationKey: KRelation,
    subQuery: IntentBuilder<
      TEntities,
      TRelations,
      {},
      TSubTag,
      ResolveRelation<TEntities, TRelations[KRelation]>["targetType"],
      TSubResult>
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult & Record<TSubTag, TSubResult[]>> {
    const operation: IncludeOperation<TEntities, TRelations, KEntity, KRelation> = {
      type: 'include',
      relationKey,
      subQuery: {
        entityKey: subQuery.entityKey,
        operations: [...subQuery.operations]
      }
    };
    this.operations.push(operation);
    return this;
  }
  
  aggregate<K extends keyof TResult, TAggregate extends AggregationType>(
    field: K,
    aggregation: TAggregate,
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult[K]> {
    const operation: AggregateOperation<TResult, K, TAggregate> = {
      type: 'aggregate',
      aggregation,
      field: field
    };
    this.operations.push(operation);
    return this;
  }
  
  build(): Intent<TEntities, TRelations, TUnits & Record<TTag, IntentUnit<TEntities, TRelations, KEntity>>> {
    const newUnit: IntentUnit<TEntities, TRelations, KEntity> = {
      entityKey: this.entityKey,
      operations: this.operations,
    };
    
    const newUnits = {
      ...this.units,
      [this.tag]: newUnit
    };
    
    return new Intent(newUnits);
  }
}