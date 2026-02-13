import type {INormalizedEntityPool} from "@/fractal-cache/types/normalized-entity-pool.ts";
import type {VerticalCheckStrategy} from "@/fractal-cache/types/diff-engine/strategy/vertical-check.ts";
import type {FieldMissingMap} from "@/fractal-cache/types/diff-engine/types.ts";

/**
 * Configuration options for vertical check strategy.
 */
interface VerticalCheckConfig {
  /**
   * Whether to use the global field mask stored on entities.
   */
  useGlobalFieldMask: boolean;
  /**
   * Source of field masks: either from entity records or query shapes.
   */
  fieldMaskSource: 'entity' | 'query';
  /**
   * Policy for handling missing entities: 'strict' treats all fields as missing,
   * 'relaxed' ignores missing entities.
   */
  requiredFieldsPolicy: 'strict' | 'relaxed';
}

/**
 * Default implementation of VerticalCheckStrategy.
 * Examines which fields are missing for a list of entity IDs based on configuration options.
 */
export class DefaultVerticalCheck implements VerticalCheckStrategy {
  private readonly config: VerticalCheckConfig;
  
  /**
   * Creates a new instance with the given configuration.
   * @param config - Configuration options for the vertical check strategy
   */
  constructor(config: VerticalCheckConfig) {
    this.config = config;
  }
  
  /**
   * Performs vertical check to determine missing fields for the given entity IDs.
   * @param entityType - The type of entities being checked
   * @param ids - The list of entity IDs to check
   * @param requiredFields - The set of fields that are required
   * @param entityPool - The entity pool containing cached entity records
   * @returns FieldMissingMap mapping entity IDs to sets of missing fields
   */
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