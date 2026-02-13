import type {DataRequest, FetchPlan, IDiffEngine} from "@/fractal-cache/types/diff-engine/abstractions.ts";
import type {IQueryBindingStore} from "@/fractal-cache/types/query-binding-store.ts";
import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {DiffEngineConfig} from "@/fractal-cache/types/diff-engine/config.ts";
import type {FetchContext} from "@/fractal-cache/types/diff-engine/fetch-context.ts";

export class DiffEngine implements IDiffEngine {
  private readonly config: DiffEngineConfig;
  private readonly entityPool: INormalizedEntityPool;
  private readonly bindingStore: IQueryBindingStore;
  
  constructor(config: DiffEngineConfig, entityPool: INormalizedEntityPool, bindingStore: IQueryBindingStore) {
    this.config = config;
    this.entityPool = entityPool;
    this.bindingStore = bindingStore;
  }
  
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
        const relReqs = this.config.relationRequest.generateRequests(
          rel,
          cachedIds,
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
    
    return {requests: allRequests};
  }
}