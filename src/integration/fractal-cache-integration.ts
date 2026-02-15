import type {UnifiedConfig} from "@/types";
import type {NormalizedIntent} from "@/fractal-cache/types/intent-parser.ts";
import {IntentNormalizer} from "@/normalization/intent-normalizer.ts";
import {IntentValidation} from "@/validation/intent-validation.ts";
import type {IntentUnit} from "@/types";

/**
 * Integration module that bridges the core intent system with the fractal cache.
 */
export class FractalCacheIntegration {
  /**
   * Validates and normalizes an intent unit for use with fractal cache
   */
  static prepareForCache<TConfig extends UnifiedConfig>(
    intentUnit: IntentUnit<TConfig, any, any, any>,
    config: TConfig
  ): NormalizedIntent {
    // Validate the intent unit
    const validation = IntentValidation.validateForFractalCache(intentUnit);
    if (!validation.success) {
      throw new Error(`Intent validation failed for fractal cache: ${validation.error}`);
    }
    
    // Normalize the intent for fractal cache
    return IntentNormalizer.normalize(intentUnit, config);
  }
  
  /**
   * Checks if an intent unit can be processed by fractal cache
   */
  static isValidForCache<TConfig extends UnifiedConfig>(
    intentUnit: IntentUnit<TConfig, any, any, any>
  ): boolean {
    const validation = IntentValidation.validateForFractalCache(intentUnit);
    return validation.success;
  }
}