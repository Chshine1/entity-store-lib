import type {NormalizedIntent} from "@/fractal-cache/types/intent-parser.ts";
import type {QueryBinding} from "@/fractal-cache/types/query-binding-store.ts";

export type FilterAST = Record<string, unknown>;

export interface OrderSpec {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface IdListRequest {
  where: FilterAST;
  orderBy: OrderSpec[];
  skip: number;
  take: number;
}

/** ID列表响应 */
export interface IdListResponse {
  ids: string[];
  total?: number;
  hasMore: boolean;
}

/** 实体数据获取请求 */
export interface EntityFetchRequest {
  entityType: string;
  ids: string[];
  fields?: string[]; // 请求的字段列表
}

/** 实体数据响应条目 */
export interface EntityData {
  id: string;
  entityType: string;
  data: Record<string, unknown>; // 实体字段值
  // 可扩展关联数据等
}

// ---------- 网络适配器抽象 ----------
export interface INetworkAdapter {
  /** 仅获取ID列表（用于主获取或关系获取的ID列表） */
  fetchIds(request: IdListRequest): Promise<IdListResponse>;
  
  /** 获取实体数据（可指定字段） */
  fetchEntities(request: EntityFetchRequest): Promise<EntityData[]>;
  
  /** 将框架的FilterAST转换为后端查询语言（SQL、GraphQL、REST参数等） */
  serializeFilter(ast: FilterAST): any;
}

// ---------- 合并器接口 ----------
export interface IReconciler {
  /** 合并ID列表响应，更新QSS及NEP */
  reconcileIds(response: IdListResponse, originalIntent: NormalizedIntent): void;
  
  /** 合并实体数据响应，更新NEP */
  reconcileEntities(response: EntityData[]): void;
}

// ---------- 策略接口 ----------
/** 缓存策略（阈值、全局配置） */
export interface ICachePolicy {
  /** 批量富化阈值：缺失某字段的实体占比超过此值则转为批量获取 */
  getBulkFieldThreshold(): number; // 默认0.3
  // 可扩展其他策略配置
}

/** 失效与验证策略 */
export interface IInvalidationPolicy {
  /** 实体变更时调用，标记相关查询片段为脏 */
  onEntityUpdated(
    entityType: string,
    entityId: string,
    changedFields?: string[]
  ): void;
  
  /** 访问查询片段时，检查是否需要重新验证 */
  shouldRevalidate(segment: QueryBinding): boolean;
}

/** 全局关系谓词缓存（用于避免重复请求） */
export interface IRelationPredicateCache {
  /** 记录某谓词下某关系的耗尽状态 */
  setExhausted(
    entityType: string,
    relationName: string,
    filterHash: string
  ): void;
  
  /** 判断是否存在比当前谓词更严格的已耗尽缓存 */
  isExhaustedSubset(
    entityType: string,
    relationName: string,
    filter: FilterAST
  ): boolean;
}