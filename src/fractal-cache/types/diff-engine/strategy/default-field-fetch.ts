import type {FieldFetchStrategy} from "@/fractal-cache/types/diff-engine/strategy/field-fetch.ts";
import type {DataRequest, FetchContext, FieldMissingMap} from "@/fractal-cache/types/diff-engine/types.ts";

/**
 * Configuration options for field fetch strategy.
 */
interface FieldFetchConfig {
  /**
   * Threshold for determining bulk fields. Fields missing in more than this proportion
   * of entities will be grouped into bulk requests.
   */
  batchThreshold: number;
  /**
   * Maximum number of IDs in a single batch request.
   */
  maxBatchSize: number;
  /**
   * Strategy for handling low-frequency fields: 'per-entity' creates individual requests
   * for each entity, 'merge-all' combines all low-frequency fields into one request.
   */
  lowFrequencyStrategy: 'per-entity' | 'merge-all';
  /**
   * Whether to prefer ID-based requests for field completion.
   */
  preferIdRequest: boolean;
}

/**
 * Default implementation of FieldFetchStrategy.
 * Generates DataRequest objects to fetch missing fields for entities based on configuration options.
 */
export class DefaultFieldFetchStrategy implements FieldFetchStrategy {
  private readonly config: FieldFetchConfig;
  
  /**
   * Creates a new instance with the given configuration.
   * @param config - Configuration options for the field fetch strategy
   */
  constructor(config: FieldFetchConfig) {
    this.config = config;
  }
  
  /**
   * Generates field completion requests based on the field missing map.
   * @param missingMap - Map of entity IDs to sets of missing fields
   * @param entityType - The type of entities needing field completion
   * @param context - The fetch context containing intent and utility functions
   * @returns Array of DataRequest objects for field completion
   */
  generateRequests(
    missingMap: FieldMissingMap,
    entityType: string,
    context: FetchContext
  ): DataRequest[] {
    if (missingMap.size === 0) {
      return [];
    }
    
    // Count how many entities are missing each field
    const fieldCount = new Map<string, number>();
    for (const [, fields] of missingMap) {
      for (const field of fields) {
        fieldCount.set(field, (fieldCount.get(field) || 0) + 1);
      }
    }
    
    // Determine bulk fields based on threshold
    const bulkFields = new Set<string>();
    const totalEntities = missingMap.size;
    
    for (const [field, count] of fieldCount) {
      if (count / totalEntities >= this.config.batchThreshold) {
        bulkFields.add(field);
      }
    }
    
    const requests: DataRequest[] = [];
    
    // Generate bulk requests for high-frequency fields
    if (bulkFields.size > 0) {
      // Group entities by the bulk fields they're missing
      const bulkFieldGroups = new Map<string, string[]>();
      
      for (const [id, fields] of missingMap) {
        const bulkFieldsForEntity = [...fields].filter(f => bulkFields.has(f)).join(',');
        if (bulkFieldsForEntity) {
          if (!bulkFieldGroups.has(bulkFieldsForEntity)) {
            bulkFieldGroups.set(bulkFieldsForEntity, []);
          }
          bulkFieldGroups.get(bulkFieldsForEntity)!.push(id);
        }
      }
      
      // Create requests for each group
      for (const [fieldsStr, ids] of bulkFieldGroups) {
        const fields = fieldsStr.split(',') as string[];
        
        // Split into batches if needed
        for (let i = 0; i < ids.length; i += this.config.maxBatchSize) {
          const batch = ids.slice(i, i + this.config.maxBatchSize);
          
          const request: DataRequest = {
            entityType,
            mode: {type: 'id', ids: batch},
            where: context.intent.where,
            orderBy: context.intent.orderBy,
            select: new Set(fields)
          };
          
          requests.push(request);
        }
      }
    }
    
    // Handle remaining (low frequency) fields based on strategy
    if (this.config.lowFrequencyStrategy === 'per-entity') {
      // Create individual requests for each entity with its low-frequency fields
      for (const [id, fields] of missingMap) {
        const lowFreqFields = [...fields].filter(f => !bulkFields.has(f));
        if (lowFreqFields.length > 0) {
          const request: DataRequest = {
            entityType,
            mode: {type: 'id', ids: [id]},
            where: context.intent.where,
            orderBy: context.intent.orderBy,
            select: new Set(lowFreqFields)
          };
          
          requests.push(request);
        }
      }
    } else if (this.config.lowFrequencyStrategy === 'merge-all') {
      // Collect all low-frequency fields and entities that need them
      const allLowFreqFields = new Set<string>();
      const allLowFreqEntityIds = new Set<string>();
      
      for (const [id, fields] of missingMap) {
        const lowFreqFields = [...fields].filter(f => !bulkFields.has(f));
        if (lowFreqFields.length > 0) {
          lowFreqFields.forEach(f => allLowFreqFields.add(f));
          allLowFreqEntityIds.add(id);
        }
      }
      
      if (allLowFreqFields.size > 0 && allLowFreqEntityIds.size > 0) {
        const entityIds = Array.from(allLowFreqEntityIds);
        
        // Split into batches if needed
        for (let i = 0; i < entityIds.length; i += this.config.maxBatchSize) {
          const batch = entityIds.slice(i, i + this.config.maxBatchSize);
          
          const request: DataRequest = {
            entityType,
            mode: {type: 'id', ids: batch},
            where: context.intent.where,
            orderBy: context.intent.orderBy,
            select: allLowFreqFields
          };
          
          requests.push(request);
        }
      }
    }
    
    return requests;
  }
}