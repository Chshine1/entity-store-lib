import type {
  AggregateConfig, IncludeConfig,
  Operation,
  QueryCondition,
  QueryOperator,
  SortCondition,
  SortDirection
} from "./common.ts";
import type {RelationsRecord, ResolveRelation, SourcedRelations} from "../relation.ts";
import {Intent} from "./intent.ts";
import type {IntentUnitsRecord, IntentUnit} from "./unit.ts";
import type {EntitiesRecord} from "../entity.ts";

export class IntentBuilder<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  TUnits extends IntentUnitsRecord,
  TTag extends string,
  KEntity extends keyof TEntities,
  TResult
> {
  private readonly tag: TTag;
  private readonly entityKey: KEntity;
  private readonly units: TUnits;
  private readonly unit: IntentUnit<TEntities, TRelations, TResult>;
  
  public constructor(
    tag: TTag,
    entityKey: KEntity,
    units: TUnits,
    existingUnit?: IntentUnit<TEntities, TRelations, TResult>
  ) {
    this.tag = tag;
    this.entityKey = entityKey;
    this.units = units;
    
    if (existingUnit) {
      this.unit = existingUnit;
    } else {
      this.unit = {
        entityKey: entityKey,
      };
    }
  }
  
  private cloneWithNewUnit<R>(
    newUnit: IntentUnit<TEntities, TRelations, R>
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, R> {
    return new IntentBuilder(
      this.tag,
      this.entityKey,
      this.units,
      newUnit
    );
  }
  
  private addChainLink(operation: Operation, data: any): IntentUnit<TEntities, TRelations, TResult> {
    return {
      ...this.unit,
      chain: {
        previous: this.unit,
        operation,
        data
      }
    };
  }
  
  where<K extends keyof TEntities[KEntity]>(
    field: K,
    operator: QueryOperator,
    value: TEntities[KEntity][K] | TEntities[KEntity][K][]
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult> {
    const condition: QueryCondition = {
      field: field as string,
      operator,
    };
    
    if (Array.isArray(value)) {
      condition.values = value;
    } else {
      condition.value = value;
    }
    
    const newUnit = this.addChainLink('where', condition);
    newUnit.where = [...(this.unit.where || []), condition];
    
    return this.cloneWithNewUnit(newUnit);
  }
  
  orderBy<K extends keyof TEntities[KEntity]>(
    field: K,
    direction: SortDirection
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult> {
    const sortCondition: SortCondition = {
      field: field as string,
      direction
    };
    
    const newUnit = this.addChainLink('orderBy', sortCondition);
    newUnit.orderBy = [...(this.unit.orderBy || []), sortCondition];
    
    return this.cloneWithNewUnit(newUnit);
  }
  
  skip(count: number): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult> {
    const newUnit = this.addChainLink('skip', count);
    newUnit.skip = count;
    
    return this.cloneWithNewUnit(newUnit);
  }
  
  take(count: number): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult> {
    const newUnit = this.addChainLink('take', count);
    newUnit.take = count;
    
    return this.cloneWithNewUnit(newUnit);
  }
  
  select<U>(
    selector: (data: TResult) => U
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, U> {
    const newUnit = this.addChainLink('select', selector);
    
    // 尝试提取字段名（如果是简单的字段选择）
    let fields: string[] | undefined;
    try {
      // 这是一个简化的实现，实际中可能需要更复杂的 AST 分析
      const selectorStr = selector.toString();
      // 这里可以添加逻辑来解析 selector 函数，提取字段名
      // 例如，对于简单的箭头函数如 x => x.id，可以提取出 'id'
    } catch {
      // 如果无法解析，就使用 transform 函数
    }
    
    newUnit.selector = {
      ...this.unit.selector,
      fields,
      transform: selector
    };
    
    // 注意：这里创建新的 builder 时，类型参数 U 替换了 TResult
    return new IntentBuilder(
      this.tag,
      this.entityKey,
      this.units,
      newUnit
    ) as any; // 类型断言，因为我们需要改变泛型参数
  }
  
  include<
    K extends keyof SourcedRelations<TEntities, TRelations, KEntity>,
    S
  >(
    relation: K,
    config: IntentBuilder<TEntities, TRelations, TUnits, TTag,
      ResolveRelation<TEntities, TRelations[K]>["targetType"], S>
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, TResult & S> {
    const includeConfig: IncludeConfig<TEntities, TRelations> = {
      relationKey: relation,
      unit: config.build().units[this.tag] // 假设这里能获取到配置的 unit
    };
    
    const newUnit = this.addChainLink('include', includeConfig);
    
    // 创建或更新 includes Map
    const includes = this.unit.includes
      ? new Map(this.unit.includes)
      : new Map();
    
    includes.set(relation as string, includeConfig);
    newUnit.includes = includes;
    
    return this.cloneWithNewUnit(newUnit) as any;
  }
  
  aggregate<U>(
    initial: U,
    accumulate: (current: U, n: TResult) => U
  ): IntentBuilder<TEntities, TRelations, TUnits, TTag, KEntity, U> {
    const aggregateConfig: AggregateConfig<U> = {
      initialValue: initial,
      accumulator: accumulate
    };
    
    const newUnit = this.addChainLink('aggregate', aggregateConfig);
    newUnit.aggregation = aggregateConfig;
    
    return new IntentBuilder(
      this.tag,
      this.entityKey,
      this.units,
      newUnit
    ) as any;
  }
  
  build(): Intent<TEntities, TRelations, TUnits & Record<TTag, IntentUnit<TEntities, TRelations, TResult>>> {
    const finalUnits = {
      ...this.units,
      [this.tag]: this.unit
    } as TUnits & Record<TTag, IntentUnit<TEntities, TRelations, TResult>>;
    
    return new Intent<TEntities, TRelations, TUnits & Record<TTag, IntentUnit<TEntities, TRelations, TResult>>>(finalUnits);
  }
}