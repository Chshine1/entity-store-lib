## 可配置 DiffEngine 详细设计（MVP）

### 1. 整体架构回顾

DiffEngine 的核心职责是根据 `Intent` 和当前缓存状态，计算出需要发起的网络请求集合 `FetchPlan`。为了实现可配置性，我们将关键决策点抽象为策略接口，并通过配置对象注入。DiffEngine 负责协调这些策略，按固定流程调用它们，生成最终的请求列表。

**固定流程**（不可配置，但策略内部可定制）：
```
computeFetchPlan(intent):
  1. 水平检查 -> 得到窗口内已缓存ID和缺失区间
  2. 垂直检查 -> 对已缓存ID检查字段缺失，得到缺失映射
  3. 生成分页请求 -> 基于缺失区间
  4. 生成字段补全请求 -> 基于缺失映射
  5. 生成关系请求 -> 对每个 include，基于父ID列表
  6. 去重合并 -> 合并所有请求
  7. 返回 FetchPlan
```

每个步骤都委托给相应的策略实现。策略通过构造函数接收配置参数，以控制其行为。

### 2. 核心策略接口与配置项

#### 2.1 水平检查策略 `HorizontalCheckStrategy`

```typescript
interface HorizontalCheckStrategy {
  check(intent: Intent, bindingStore: IQueryBindingStore): HorizontalResult;
}
```

**职责**：根据 `Intent` 和查询绑定缓存，确定目标窗口 `[skip, skip+take)` 内哪些索引有已缓存的实体ID，哪些缺失。

**配置项**（通过构造函数传入）：
- `useCache: boolean` —— 是否使用缓存。若为 `false`，则始终视为无缓存（`missingIntervals = [[skip, skip+take-1]]`，`windowIds` 全为 `null`）。
- `allowPartialCache: boolean` —— 是否允许部分缓存（即如果缓存区间不连续，仍返回部分ID）。若为 `false`，只要有任何缺失区间，就认为整个窗口缺失（可用于后端不支持部分缓存查询的情况）。
- `maxIntervalMergeGap: number` —— 当计算 `missingIntervals` 时，如果两个缺失区间之间的间隔小于等于此值，则合并为一个区间（以生成更大的分页请求，减少请求数）。默认0（不合并）。

**默认实现 `DefaultHorizontalCheck` 逻辑**：
1. 根据 `intent` 计算 `definitionId` 和 `paramHash`（复用工具函数）。
2. 从 `bindingStore` 获取 `QueryBinding`，若无则返回全缺失。
3. 获取 `binding.intervals` 和 `indexToId`。
4. 遍历窗口索引 `i` 从 `skip` 到 `skip+take-1`：
    - 查找包含索引 `i` 的区间，若存在且 `indexToId` 中有该索引，则 `windowIds[i-skip] = indexToId.get(i)`；否则为 `null`。
5. 计算 `missingIntervals`：收集连续为 `null` 的索引区间。若 `allowPartialCache` 为 `false` 且存在任何 `null`，则返回 `missingIntervals = [[skip, skip+take-1]]`，`windowIds` 全 `null`。
6. 合并缺失区间：遍历 `missingIntervals`，若相邻区间的间隔（后区间起始 - 前区间结束 - 1） ≤ `maxIntervalMergeGap`，则合并。
7. 设置 `needIdFetch` 为 `missingIntervals.length > 0`。
8. 返回 `HorizontalResult`。

#### 2.2 垂直检查策略 `VerticalCheckStrategy`

```typescript
interface VerticalCheckStrategy {
  check(
    entityType: string,
    ids: string[],
    requiredFields: Set<string>,
    entityPool: IEntityPool
  ): FieldMissingMap;
}
```

**职责**：检查一批实体的字段缺失情况，返回每个实体缺失的字段集合。

**配置项**：
- `useGlobalFieldMask: boolean` —— 是否使用实体上的全局字段掩码（`EntityRecord.fieldMask`）。若为 `false`，则可能结合其他来源（如查询形状缓存），但MVP只支持全局掩码。
- `fieldMaskSource: 'entity' | 'query'` —— 字段掩码来源。若为 `'entity'`，则使用实体上的 `fieldMask`；若为 `'query'`，则需传入查询形状上下文（暂不支持，MVP只实现 `'entity'`）。
- `requiredFieldsPolicy: 'strict' | 'relaxed'` —— 如果实体不存在（`entityPool.getRecord` 返回 `undefined`），如何处理：
    - `'strict'`：视为所有字段缺失（生成缺失映射）。
    - `'relaxed'`：忽略该实体（不加入缺失映射），通常与水平检查配合，水平检查应保证传入的 `ids` 都是已缓存的实体。但以防万一，默认 `'strict'`。

**默认实现 `DefaultVerticalCheck` 逻辑**：
1. 初始化 `missingMap = new Map()`。
2. 对每个 `id`：
    - 从 `entityPool` 获取 `record`。
    - 如果 `record` 不存在，根据 `requiredFieldsPolicy`：
        - `'strict'`：`missingMap.set(id, new Set(requiredFields))`。
        - `'relaxed'`：跳过。
    - 否则，计算缺失字段：`[...requiredFields].filter(f => !record.fieldMask.has(f))`。
    - 若结果长度 > 0，`missingMap.set(id, new Set(missing))`。
3. 返回 `missingMap`。

#### 2.3 字段补全请求生成策略 `FieldFetchStrategy`

```typescript
interface FieldFetchStrategy {
  generateRequests(
    missingMap: FieldMissingMap,
    entityType: string,
    context: FetchContext
  ): DataRequest[];
}
```

**职责**：根据字段缺失映射，生成用于补全字段的 `DataRequest`（通常是按ID获取）。

**配置项**：
- `batchThreshold: number` —— 字段批量阈值，范围 [0,1]。对于每个字段，统计缺失该字段的实体数占所有缺失实体的比例。若 ≥ 阈值，则将该字段纳入“批量字段集”，为所有缺失该字段的实体生成一个批量请求；否则，为每个实体单独生成请求（或合并低频字段）。
- `maxBatchSize: number` —— 单个批量请求的最大ID数量。如果缺失某字段的实体数超过此值，则拆分为多个请求。
- `lowFrequencyStrategy: 'per-entity' | 'merge-all'` —— 低频字段（低于阈值）的处理方式：
    - `'per-entity'`：为每个缺失实体生成一个独立请求，包含该实体缺失的所有低频字段。
    - `'merge-all'`：将所有低频字段合并为一个请求，为所有缺失这些字段的实体获取这些字段（但可能导致获取不需要的字段）。
- `preferIdRequest: boolean` —— 是否优先使用 `id` 模式请求（`mode: { type: 'id', ids }`）。若为 `false`，可考虑其他模式（如条件查询），但MVP只支持 `id` 模式。

**默认实现 `DefaultFieldFetchStrategy` 逻辑**：
1. 如果 `missingMap` 为空，返回空数组。
2. 统计每个字段的缺失次数：遍历 `missingMap`，对每个缺失字段计数。
3. 确定批量字段集 `bulkFields`：缺失次数 / 总实体数 ≥ `batchThreshold` 的字段。
4. 生成批量请求：
    - 对每个批量字段（或合并为一个请求），收集所有缺失该字段的实体ID列表。
    - 按 `maxBatchSize` 拆分ID列表，生成多个 `DataRequest`，`select` 包含该字段（或这些字段）。
5. 处理剩余字段：
    - 如果 `lowFrequencyStrategy === 'per-entity'`，则遍历 `missingMap` 中每个实体，取其缺失字段中不在 `bulkFields` 的部分，若不为空，为该实体生成一个请求（`select` 为该实体缺失的非批量字段）。
    - 如果 `lowFrequencyStrategy === 'merge-all'`，则收集所有缺失低频字段的实体ID，以及所有低频字段，生成一个（或按 `maxBatchSize` 拆分）请求，`select` 为所有低频字段。
6. 返回所有生成的请求。

#### 2.4 分页请求生成策略 `PaginationRequestStrategy`

```typescript
interface PaginationRequestStrategy {
  generateRequests(
    missingIntervals: Array<[number, number]>,
    intent: Intent,
    context: FetchContext
  ): DataRequest[];
}
```

**职责**：根据缺失区间列表，生成 `pagination` 请求。

**配置项**：
- `intervalMergeStrategy: 'none' | 'adjacent' | 'all'`：
    - `'none'`：每个区间生成一个独立请求。
    - `'adjacent'`：合并相邻区间（即 `[a,b]` 和 `[b+1,c]` 合并为 `[a,c]`）。
    - `'all'`：将所有区间合并为一个覆盖从最小 `skip` 到最大 `skip+take-1` 的连续请求（可能导致获取窗口外的数据）。
- `allowOverfetch: boolean` —— 当 `intervalMergeStrategy` 为 `'all'` 时，是否允许获取窗口外的数据。若为 `false`，则仍限制在窗口范围内。
- `maxTakePerRequest: number` —— 单个分页请求的最大 `take` 值。如果合并后的区间长度超过此值，则拆分为多个请求（例如按 `maxTake` 分段）。

**默认实现 `DefaultPaginationRequestStrategy` 逻辑**：
1. 如果 `missingIntervals` 为空，返回空数组。
2. 根据 `intervalMergeStrategy` 合并区间：
    - `'none'`：直接使用原区间列表。
    - `'adjacent'`：遍历排序后的区间，合并相邻的。
    - `'all'`：取所有区间的最小 `start` 和最大 `end`，生成一个新区间。
3. 对每个合并后的区间 `[start, end]`，如果 `allowOverfetch === false`，则将其裁剪到窗口范围内（窗口为 `[intent.skip, intent.skip+intent.take-1]`）。
4. 对每个区间，根据 `maxTakePerRequest` 拆分：如果区间长度 > `maxTakePerRequest`，则拆分成多个子区间，每个长度 ≤ `maxTakePerRequest`。
5. 对每个子区间 `[subStart, subEnd]`，生成一个 `DataRequest`：
    - `mode: { type: 'pagination', skip: subStart, take: subEnd - subStart + 1 }`
    - `entityType`, `where`, `orderBy` 从 `intent` 复制
    - `select` 复制 `intent.select`（可能为 `undefined` 表示所有字段）
6. 返回请求列表。

#### 2.5 关系请求生成策略 `RelationRequestStrategy`

```typescript
interface RelationRequestStrategy {
  generateRequests(
    relationIntent: RelationIntent,
    parentIds: string[],
    entityPool: IEntityPool,
    context: FetchContext
  ): DataRequest[];
}
```

**职责**：处理一个关系查询，生成子实体的请求。

**配置项**：
- `batching: 'none' | 'by-parent' | 'by-parent-batch'`：
    - `'none'`：为每个父实体生成独立的请求（如果父实体没有缓存该关系的状态）。
    - `'by-parent'`：为每个父实体独立请求，但可考虑合并相同查询形状的请求（由去重策略处理）。
    - `'by-parent-batch'`：尝试将多个父实体的请求合并为一个批量请求，利用后端支持的 `parentId IN (...)` 条件。
- `maxBatchSize: number` —— 当使用 `'by-parent-batch'` 时，每个批量请求最多包含的父ID数量（用于拆分 IN 子句）。
- `useParentCache: boolean` —— 是否检查父实体上的 `relationQueries` 缓存。若为 `false`，则每个父实体都视为无缓存。
- `inheritParentPagination: boolean` —— 当使用批量请求时，如何处理分页参数。若为 `true`，则所有父实体使用相同的 `skip`/`take`（取最大值），但需在 `metadata` 中记录每个父实体的原始分页，以便后续裁剪；若为 `false`，则不支持批量分页，回退为独立请求。

**默认实现 `DefaultRelationRequestStrategy` 逻辑**：
1. 如果 `parentIds` 为空，返回空数组。
2. 如果 `useParentCache` 为 `true`：
    - 对每个父ID，从 `entityPool` 获取父实体记录，从 `record.relationQueries` 中查找与 `relationIntent` 匹配的查询状态（计算 `definitionId` 和 `paramHash`）。
    - 如果找到，利用其 `intervals` 进行水平检查，得到该父实体的子列表窗口ID和缺失区间（类似主查询的水平检查，但针对该父实体的关系缓存）。缺失区间即为需要请求的区间。
    - 如果未找到，视为全区间缺失（即 `[relationIntent.skip, relationIntent.skip+relationIntent.take-1]`）。
3. 收集所有父实体的缺失区间列表，每个缺失区间关联一个父ID。
4. 根据 `batching` 策略生成请求：
    - `'none'` 或 `'by-parent'`：为每个有缺失区间的父实体生成一个独立的 `pagination` 请求（使用 `relationIntent` 的 `where`，但需将父ID条件嵌入 `where` 中）。`where` 应为 `{ ...relationIntent.where, parentId: parentId }` 的形式（假设关系字段名为 `parentId`，实际需根据 `relationName` 构造）。`skip`/`take` 取该父实体的缺失区间（可能合并多个区间后）。返回所有请求。
    - `'by-parent-batch'`：
        - 将父实体按缺失区间分组（因为不同父实体的缺失区间可能不同）。对于拥有相同缺失区间 `[start, end]` 的父实体，可以合并为一个批量请求。
        - 对每组 `(start, end)` 和对应的父ID列表 `pids`，按 `maxBatchSize` 拆分 `pids`，为每个子批次生成一个请求：
            - `mode: { type: 'pagination', skip: start, take: end - start + 1 }`
            - `where`：包含 `parentId IN (pids)` 以及 `relationIntent.where` 的其他条件。
            - `metadata` 中可记录每个父ID对应的原始 `skip`/`take`，以便响应后更新各自的缓存。
        - 注意：如果不同父实体的缺失区间不一致，则无法合并，需退化为独立请求或分别处理。
5. 返回生成的请求列表。

#### 2.6 请求去重与合并策略 `RequestDeduplicationStrategy`

```typescript
interface RequestDeduplicationStrategy {
  deduplicate(requests: DataRequest[]): DataRequest[];
}
```

**职责**：对生成的请求列表进行去重和合并，减少重复请求。

**配置项**：
- `mergeIdRequests: boolean` —— 是否合并相同 `entityType`、相同 `select` 的多个 `id` 请求（即合并ID列表）。
- `mergePaginationRequests: boolean` —— 是否合并相同 `entityType`、相同 `where`、相同 `orderBy`、相同 `select` 的多个 `pagination` 请求（例如连续区间合并），但合并需谨慎，可能引入多余数据。
- `idRequestMergeMaxSize: number` —— 合并后的ID请求中最大ID数量，超过则拆分。

**默认实现 `DefaultDeduplicationStrategy` 逻辑**：
1. 创建一个 Map，键为请求的去重键，值为请求对象（或待合并的列表）。
2. 遍历所有请求，对每个请求生成去重键：
    - 对于 `id` 请求：键 = `${entityType}|id|${sortedIds}|${select}`，其中 `sortedIds` 是对ID列表排序后拼接的字符串。
    - 对于 `pagination` 请求：键 = `${entityType}|pagination|${stringifyWhere}|${stringifyOrderBy}|${skip}|${take}|${select}`。
3. 如果遇到相同键的请求，根据类型和配置决定合并：
    - 对于 `id` 请求且 `mergeIdRequests` 为 `true`：合并ID列表（取并集），如果合并后ID数量超过 `idRequestMergeMaxSize`，则拆分（重新生成多个请求）。但为了简化，MVP中可以只合并，不拆分（即允许超长列表，由网络层处理）。
    - 对于 `pagination` 请求且 `mergePaginationRequests` 为 `true`：如果是相邻区间且 `skip`/`take` 连续，可合并为一个区间。但需检查 `where`/`orderBy`/`select` 完全相同。MVP可先不实现 `pagination` 合并，留作扩展。
4. 返回去重后的请求列表（可能合并后的新请求替换原请求）。

#### 2.7 辅助类型：`FetchContext`

```typescript
interface FetchContext {
  intent: Intent;                     // 原始 Intent
  entityPool: IEntityPool;
  bindingStore: IQueryBindingStore;
  utils: {
    computeDefinitionId: (entityType: string, orderBy: OrderSpec[], whereTemplate: any) => string;
    computeParamHash: (params: any) => string;
    extractTemplate: (where: any) => any;
    extractParams: (where: any) => any;
  };
}
```

### 3. 配置对象与 DiffEngine 构造函数

```typescript
interface DiffEngineConfig {
  horizontalCheck: HorizontalCheckStrategy;
  verticalCheck: VerticalCheckStrategy;
  fieldFetch: FieldFetchStrategy;
  paginationRequest: PaginationRequestStrategy;
  relationRequest: RelationRequestStrategy;
  requestDeduplication?: RequestDeduplicationStrategy; // 可选
}

class DiffEngine implements IDiffEngine {
  constructor(
    private config: DiffEngineConfig,
    private entityPool: IEntityPool,
    private bindingStore: IQueryBindingStore
  ) {}

  computeFetchPlan(intent: Intent): FetchPlan {
    const context: FetchContext = {
      intent,
      entityPool: this.entityPool,
      bindingStore: this.bindingStore,
      utils: {
        computeDefinitionId,
        computeParamHash,
        extractTemplate,
        extractParams,
      }
    };

    // 1. 水平检查
    const horizontalResult = this.config.horizontalCheck.check(intent, this.bindingStore);

    // 获取窗口内已缓存的实体ID（非null）
    const cachedIds = horizontalResult.windowIds.filter(id => id !== null) as string[];

    // 2. 垂直检查
    const missingMap = this.config.verticalCheck.check(
      intent.entityType,
      cachedIds,
      intent.select || new Set(),
      this.entityPool
    );

    // 3. 生成分页请求
    const paginationRequests = this.config.paginationRequest.generateRequests(
      horizontalResult.missingIntervals,
      intent,
      context
    );

    // 4. 生成字段补全请求
    const fieldRequests = this.config.fieldFetch.generateRequests(
      missingMap,
      intent.entityType,
      context
    );

    // 5. 生成关系请求
    let relationRequests: DataRequest[] = [];
    if (intent.include) {
      for (const rel of intent.include) {
        // 父ID列表 = 当前窗口内所有已缓存的实体ID（注意：如果窗口有缺失，可能只有部分父实体，但关系查询通常基于已有的父实体）
        // 更精确的做法可能是从 entityPool 中获取所有可能作为父实体的ID，但为简化，就用 cachedIds
        const parentIds = cachedIds; 
        const relReqs = this.config.relationRequest.generateRequests(
          rel,
          parentIds,
          this.entityPool,
          context
        );
        relationRequests.push(...relReqs);
      }
    }

    // 6. 去重合并
    let allRequests = [...paginationRequests, ...fieldRequests, ...relationRequests];
    if (this.config.requestDeduplication) {
      allRequests = this.config.requestDeduplication.deduplicate(allRequests);
    }

    return { requests: allRequests };
  }
}
```

### 4. 使用示例

```typescript
// 为传统REST API创建配置
const restConfig: DiffEngineConfig = {
  horizontalCheck: new DefaultHorizontalCheck({
    useCache: true,
    allowPartialCache: true,
    maxIntervalMergeGap: 5,
  }),
  verticalCheck: new DefaultVerticalCheck({
    useGlobalFieldMask: true,
    requiredFieldsPolicy: 'strict',
  }),
  fieldFetch: new DefaultFieldFetchStrategy({
    batchThreshold: 0.3,
    maxBatchSize: 100,
    lowFrequencyStrategy: 'per-entity',
    preferIdRequest: true,
  }),
  paginationRequest: new DefaultPaginationRequestStrategy({
    intervalMergeStrategy: 'adjacent',
    allowOverfetch: false,
    maxTakePerRequest: 1000,
  }),
  relationRequest: new DefaultRelationRequestStrategy({
    batching: 'by-parent-batch',
    maxBatchSize: 50,
    useParentCache: true,
    inheritParentPagination: true,
  }),
  requestDeduplication: new DefaultDeduplicationStrategy({
    mergeIdRequests: true,
    idRequestMergeMaxSize: 200,
    mergePaginationRequests: false,
  }),
};

const diffEngine = new DiffEngine(restConfig, entityPool, bindingStore);
const plan = diffEngine.computeFetchPlan(someIntent);
```

### 5. 策略协作说明

- **水平检查** 与 **垂直检查** 是独立的：水平检查只关心实体ID是否存在，垂直检查关心实体字段是否完整。两者结合才能判断完整缺失情况。
- **字段补全请求** 依赖于垂直检查输出的 `missingMap`，而 `missingMap` 中的实体ID来源于水平检查的缓存窗口。
- **关系请求** 使用的父ID列表通常来自水平检查的缓存窗口（即当前页的实体），但严格来说，关系查询可能涉及不在当前窗口的父实体（如通过ID直接访问）。为简化MVP，我们限制为当前窗口的父实体；更复杂的场景可由上层通过单独的 `Intent` 处理。
- **去重策略** 作用于所有生成的请求，可以合并相同ID请求，减少网络重复。

### 6. 扩展性说明

- 每个策略都可以独立替换，开发者可编写自定义策略实现特殊逻辑（如对接GraphQL的字段补全）。
- 配置项设计为简单值，便于序列化和动态调整。
- 未来可引入策略工厂，根据实体类型或运行时状态动态选择不同策略。

### 7. 需要注意的细节

- 水平检查中 `maxIntervalMergeGap` 用于合并缺失区间，但合并后可能获取超出实际缺失范围的数据，需权衡。
- 字段补全策略中 `batchThreshold` 需要合理设置，过低可能导致大量不必要的数据获取，过高可能导致请求数增加。
- 关系请求策略中 `inheritParentPagination` 若为 `true`，则需在 `metadata` 中携带每个父ID的原始分页，以便响应更新缓存时正确裁剪。
- 去重策略合并ID请求时，需注意ID列表去重，且可能产生超长请求，网络层应有处理能力。

以上MVP设计提供了可配置的DiffEngine核心，开发者可以根据后端能力调整策略，以达到最佳性能。后续可根据实际需求增加更多策略和配置项。