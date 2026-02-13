import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {VerticalCheckStrategy} from "@/fractal-cache/types/diff-engine/strategy/vertical-check.ts";
import type {FieldMissingMap} from "@/fractal-cache/types/diff-engine/types.ts";

interface VerticalCheckConfig {
  useGlobalFieldMask: boolean;
  fieldMaskSource: 'entity' | 'query';
  requiredFieldsPolicy: 'strict' | 'relaxed';
}

export class DefaultVerticalCheck implements VerticalCheckStrategy {
  private readonly config: VerticalCheckConfig;
  
  constructor(config: VerticalCheckConfig) {
    this.config = config;
  }
  
  check(
    entityType: string,
    ids: string[],
    requiredFields: Set<string>,
    entityPool: INormalizedEntityPool
  ): FieldMissingMap {
    const missingMap = new Map<string, Set<string>>();
    
    for (const id of ids) {
      const record = entityPool.getRecord(entityType, id);
      
      if (!record) {
        // Entity doesn't exist in pool
        if (this.config.requiredFieldsPolicy === 'strict') {
          missingMap.set(id, new Set(requiredFields));
        }
        // If 'relaxed', skip this entity
        continue;
      }
      
      // Calculate missing fields based on field mask
      const missing = new Set<string>();
      for (const field of requiredFields) {
        if (!record.fieldMask.has(field as keyof typeof record.data)) {
          missing.add(field);
        }
      }
      
      if (missing.size > 0) {
        missingMap.set(id, missing);
      }
    }
    
    return missingMap;
  }
}