import type {BaseEntity, EntityKeys, ExtractEntity, UnifiedConfig} from "@/types";
import {Intent} from "@/core/intent.ts";

export interface EntityMeta {
  createdAt: number;
  updatedAt: number;
  accessedAt: number;
  accessCount: number;
}

export interface MissEventPayload {
  entityKey: string;
  missedFields: string[];
  entityIds: string[];
}

export class EntityCore<TConfig extends UnifiedConfig> {
  // @ts-ignore
  private readonly config: TConfig;
  
  private data: Map<string, Map<string, Record<string, any>>> = new Map();
  private meta: Map<string, Map<string, EntityMeta>> = new Map();
  private missListeners: Array<(payload: MissEventPayload) => void> = [];
  
  constructor(config: TConfig) {
    this.config = config;
  }
  
  createIntent(): Intent<TConfig, {}> {
    return new Intent({});
  }
  
  set<K extends EntityKeys<TConfig>>(
    entityKey: K,
    id: string,
    data: Partial<Omit<ExtractEntity<TConfig, K>, keyof BaseEntity>>
  ): void {
    let entityMap = this.data.get(entityKey);
    if (!entityMap) {
      entityMap = new Map();
      this.data.set(entityKey, entityMap);
    }
    
    const existing = entityMap.get(id) || {};
    const newData = {...existing, ...data};
    entityMap.set(id, newData);
    
    let metaMap = this.meta.get(entityKey);
    if (!metaMap) {
      metaMap = new Map();
      this.meta.set(entityKey, metaMap);
    }
    const now = Date.now();
    const existingMeta = metaMap.get(id);
    if (existingMeta) {
      metaMap.set(id, {
        ...existingMeta,
        updatedAt: now,
        accessedAt: now,
        accessCount: existingMeta.accessCount + 1,
      });
    } else {
      metaMap.set(id, {
        createdAt: now,
        updatedAt: now,
        accessedAt: now,
        accessCount: 1,
      });
    }
  }
  
  read<K extends EntityKeys<TConfig>>(
    entityKey: K,
    ids: string[],
    fields: Array<keyof ExtractEntity<TConfig, K> & string>
  ): Record<string, Partial<Pick<ExtractEntity<TConfig, K>, typeof fields[number]>>> {
    const entityMap = this.data.get(entityKey) || new Map();
    const metaMap = this.meta.get(entityKey) || new Map();
    
    const results: Record<string, any> = {};
    const missedEntityIds = new Set<string>();
    const missedFieldsSet = new Set<string>();
    
    const now = Date.now();
    
    for (const id of ids) {
      const entity = entityMap.get(id);
      const record: Record<string, any> = {};
      
      if (!entity) {
        fields.forEach(f => missedFieldsSet.add(f as string));
        missedEntityIds.add(id);
      } else {
        for (const field of fields) {
          if (Object.prototype.hasOwnProperty.call(entity, field)) {
            record[field] = entity[field];
          } else {
            missedFieldsSet.add(field as string);
            missedEntityIds.add(id);
          }
        }
        
        const meta = metaMap.get(id);
        if (meta) {
          metaMap.set(id, {
            ...meta,
            accessedAt: now,
            accessCount: meta.accessCount + 1,
          });
        }
      }
      
      results[id] = record;
    }
    
    if (missedEntityIds.size > 0) {
      this.emitMiss({
        entityKey: entityKey as string,
        missedFields: Array.from(missedFieldsSet),
        entityIds: Array.from(missedEntityIds),
      });
    }
    
    return results;
  }
  
  delete<K extends EntityKeys<TConfig>>(entityKey: K, id: string): boolean {
    const entityMap = this.data.get(entityKey);
    const metaMap = this.meta.get(entityKey);
    const existed = entityMap?.delete(id) ?? false;
    metaMap?.delete(id);
    return existed;
  }
  
  onMiss(listener: (payload: MissEventPayload) => void): () => void {
    this.missListeners.push(listener);
    return () => {
      const index = this.missListeners.indexOf(listener);
      if (index > -1) this.missListeners.splice(index, 1);
    };
  }
  
  private emitMiss(payload: MissEventPayload): void {
    this.missListeners.forEach(fn => fn(payload));
  }
  
  cleanup(options?: { maxAge?: number; maxCountPerEntity?: number }): void {
    const now = Date.now();
    const {maxAge, maxCountPerEntity} = options || {};
    
    for (const [entityKey, metaMap] of this.meta.entries()) {
      const entityMap = this.data.get(entityKey);
      if (!entityMap) continue;
      
      if (maxAge !== undefined) {
        for (const [id, meta] of metaMap.entries()) {
          if (now - meta.accessedAt > maxAge) {
            entityMap.delete(id);
            metaMap.delete(id);
          }
        }
      }
      
      if (maxCountPerEntity !== undefined && metaMap.size > maxCountPerEntity) {
        const sorted = Array.from(metaMap.entries())
          .sort((a, b) => b[1].accessedAt - a[1].accessedAt) // 最近访问在前
          .slice(maxCountPerEntity);
        
        for (const [id] of sorted) {
          entityMap.delete(id);
          metaMap.delete(id);
        }
      }
    }
  }
}