import type {FilterAST, OrderSpec} from "@/fractal-cache/core.ts";

/**
 * query definition describing the structure of a query, with parameter placeholders
 */
export interface QueryDefinition {
  /** hash: entityType + orderBy + normalized template where AST */
  id: string;
  entityType: string;
  orderBy: OrderSpec[];
  /** AST with placeholders */
  whereTemplate: FilterAST;
}

/**
 * query binding consisting of a definition and the filled parameters, along with metadata like pagination
 */
export interface QueryBinding {
  definitionId: string;
  /** hash for the actually passed parameters */
  paramHash: string;
  /** actual parameters, for example, { parentId: 1, minLikes: 100 } */
  parameters: Record<string, any>;
  
  intervals: Array<[number, number]>;
  indexToId: Map<number, string>;
  isExhausted: boolean;
  
  dirty: boolean;
  lastValidateAt: number;
}

export interface IQueryBindingStore {
  getDefinition(defId: string): QueryDefinition | undefined;
  
  saveDefinition(def: QueryDefinition): void;
  
  getAllDefinitions(): QueryDefinition[];
  
  getBinding(defId: string, paramHash: string): QueryBinding | undefined;
  
  saveBinding(binding: QueryBinding): void;
  
  deleteBinding(defId: string, paramHash: string): void;
  
  findBindingsByDefinition(defId: string): QueryBinding[];
  
  mergeInterval(
    defId: string,
    paramHash: string,
    newInterval: [number, number],
    idMap: Map<number, string>
  ): void;
  
  getWindowIds(
    defId: string,
    paramHash: string,
    skip: number,
    take: number
  ): Array<string | null>;
  
  markDirty(defId: string, paramHash: string): void;
  
  invalidateByParent(parentType: string, parentId: string, relationName?: string): void;
  
  computeDefinitionId(entityType: string, orderBy: OrderSpec[], whereTemplate: FilterAST): string;
  
  computeParamHash(params: Record<string, any>): string;
}