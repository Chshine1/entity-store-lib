import type {
  IntentSource,
  IntentUnit,
  IntentUnitsRecord,
  UnifiedConfig
} from "@/types";

/**
 * Validates whether an intent unit can be processed by the fractal cache system.
 * Entity-based queries must only use operations that can be translated to backend requests.
 */
export class IntentValidation {
  /**
   * Validates if an intent unit follows fractal cache constraints
   * @param unit The intent unit to validate
   * @returns Validation result with success flag and error message if failed
   */
  static validateForFractalCache<TConfig extends UnifiedConfig, TUnits extends IntentUnitsRecord, KSource extends IntentSource<TConfig, TUnits>, TResult>(
    unit: IntentUnit<TConfig, TUnits, KSource, TResult>
  ): ValidationResult {
    // Check if the source is an entity (as opposed to a unit from a previous query)
    const isEntityBased = unit.sourceKey.type === 'entity';
    
    if (!isEntityBased) {
      // Unit-based queries (from previous queries) can use any operations
      return { success: true };
    }
    
    // For entity-based queries, validate that only supported operations are used
    for (const operation of unit.operations) {
      const validationResult = this.validateOperation(operation);
      if (!validationResult.success) {
        return validationResult;
      }
      
      // If operation is an include, recursively validate the sub-query
      if (operation.type === 'include') {
        const subValidation = this.validateForFractalCache(operation.subQuery);
        if (!subValidation.success) {
          return {
            success: false,
            error: `Include operation validation failed: ${subValidation.error}`
          };
        }
      }
    }
    
    return { success: true };
  }
  
  /**
   * Validates a single operation against fractal cache constraints
   */
  private static validateOperation(operation: any): ValidationResult {
    // Supported operations for fractal cache
    const supportedOperations = ['where', 'orderBy', 'skip', 'take', 'select', 'include'];
    
    if (!supportedOperations.includes(operation.type)) {
      return {
        success: false,
        error: `Operation '${operation.type}' is not supported by fractal cache system. Only ${supportedOperations.join(', ')} operations are allowed for entity-based queries.`
      };
    }
    
    // Additional validation for specific operation types could go here
    return { success: true };
  }
}

interface ValidationResult {
  success: boolean;
  error?: string;
}