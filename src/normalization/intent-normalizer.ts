import type {
  IntentSource,
  IntentUnit,
  IntentUnitsRecord,
  UnifiedConfig
} from "@/types";
import type {FilterAST, OrderSpec} from "@/fractal-cache/core.ts";
import type {NormalizedIntent, RelationIntent} from "@/fractal-cache/types/intent-parser.ts";
import {IntentValidation} from "@/validation/intent-validation.ts";

/**
 * Translates IntentUnit objects to NormalizedIntent format for fractal cache processing.
 */
export class IntentNormalizer {
  /**
   * Converts an IntentUnit to a NormalizedIntent that can be processed by fractal cache
   */
  static normalize<TConfig extends UnifiedConfig, TUnits extends IntentUnitsRecord, KSource extends IntentSource<TConfig, TUnits>, TResult>(
    unit: IntentUnit<TConfig, TUnits, KSource, TResult>,
    config: TConfig
  ): NormalizedIntent<TResult> {
    // Validate that the unit can be processed by fractal cache
    const validation = IntentValidation.validateForFractalCache(unit);
    if (!validation.success) {
      throw new Error(`Intent validation failed: ${validation.error}`);
    }
    
    // Since this is for fractal cache, we expect the source to be an entity
    if (unit.sourceKey.type !== 'entity') {
      throw new Error('Only entity-based queries can be normalized for fractal cache');
    }
    
    // Initialize default values
    const normalizedIntent: NormalizedIntent<TResult> = {
      entityType: unit.sourceKey.key,
      where: {},
      orderBy: [],
      skip: 0,
      take: Number.MAX_SAFE_INTEGER, // Default to unlimited if not specified
    };
    
    // Process each operation in sequence
    for (const operation of unit.operations) {
      this.applyOperation(normalizedIntent, operation, config);
    }
    
    return normalizedIntent;
  }
  
  /**
   * Applies a single operation to the normalized intent
   */
  private static applyOperation<TResult>(
    normalizedIntent: NormalizedIntent<TResult>,
    operation: any, // Using any to avoid complex type constraints
    config: any
  ): void {
    switch (operation.type) {
      case 'where':
        this.applyWhereOperation(normalizedIntent, operation);
        break;
      case 'orderBy':
        this.applyOrderByOperation(normalizedIntent, operation);
        break;
      case 'skip':
        this.applySkipOperation(normalizedIntent, operation);
        break;
      case 'take':
        this.applyTakeOperation(normalizedIntent, operation);
        break;
      case 'select':
        this.applySelectOperation(normalizedIntent, operation);
        break;
      case 'include':
        this.applyIncludeOperation(normalizedIntent, operation, config);
        break;
      default:
        throw new Error(`Unsupported operation type for normalization: ${operation.type}`);
    }
  }
  
  private static applyWhereOperation<TResult>(
    normalizedIntent: NormalizedIntent<TResult>,
    operation: any // Using any to bypass type constraints
  ): void {
    // Convert the operation to filter AST format
    const filterAST: FilterAST = {
      [operation.field as string]: {
        [operation.operator]: operation.value
      }
    };
    
    // Merge with existing filters (in a real implementation, this would be more sophisticated)
    normalizedIntent.where = {...normalizedIntent.where, ...filterAST};
  }
  
  private static applyOrderByOperation<TResult>(
    normalizedIntent: NormalizedIntent<TResult>,
    operation: any
  ): void {
    const orderSpec: OrderSpec = {
      field: operation.field as string,
      direction: operation.direction.toUpperCase() as 'ASC' | 'DESC'
    };
    
    normalizedIntent.orderBy.push(orderSpec);
  }
  
  private static applySkipOperation<TResult>(
    normalizedIntent: NormalizedIntent<TResult>,
    operation: any
  ): void {
    normalizedIntent.skip = operation.count;
  }
  
  private static applyTakeOperation<TResult>(
    normalizedIntent: NormalizedIntent<TResult>,
    operation: any
  ): void {
    normalizedIntent.take = operation.count;
  }
  
  private static applySelectOperation<TResult>(
    normalizedIntent: NormalizedIntent<TResult>,
    operation: any
  ): void {
    normalizedIntent.select = new Set(operation.fields as (keyof TResult & string)[]);
  }
  
  private static applyIncludeOperation<TResult, TConfig>(
    normalizedIntent: NormalizedIntent<TResult>,
    operation: any,
    config: TConfig
  ): void {
    if (!normalizedIntent.include) {
      normalizedIntent.include = [];
    }
    
    // Normalize the sub-query - casting to the expected type
    const subQuery = operation.subQuery as IntentUnit<any, any, any, any>;
    const subNormalizedIntent = this.normalize(subQuery, config);
    
    // Create relation intent with additional relation-specific properties
    const relationIntent: RelationIntent = {
      ...subNormalizedIntent,
      relationName: operation.relationKey as string
    };
    
    normalizedIntent.include.push(relationIntent);
  }
}