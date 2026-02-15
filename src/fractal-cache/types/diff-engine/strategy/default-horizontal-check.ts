import type {NormalizedIntent} from "@/fractal-cache/types/intent-parser.ts";
import type {HorizontalCheckStrategy} from "@/fractal-cache/types/diff-engine/strategy/horizontal-check.ts";
import type {HorizontalResult} from "@/fractal-cache/types/diff-engine";

/**
 * Configuration options for horizontal check strategy.
 */
interface HorizontalCheckConfig {
  /**
   * Whether to use cache. If false, always returns missing intervals.
   */
  useCache: boolean;
  /**
   * Whether to allow partial cache (non-continuous intervals). If false,
   * treats any missing intervals as complete window miss.
   */
  allowPartialCache: boolean;
  /**
   * Maximum gap between missing intervals to merge them into one interval.
   * Default is 0 (no merging).
   */
  maxIntervalMergeGap: number;
}

/**
 * Default implementation of HorizontalCheckStrategy.
 * Determines which indices in the target window [skip, skip+take) have cached entity IDs
 * and which intervals are missing, based on configuration options.
 */
export class DefaultHorizontalCheck implements HorizontalCheckStrategy {
  private readonly config: HorizontalCheckConfig;
  
  /**
   * Creates a new instance with the given configuration.
   * @param config - Configuration options for the horizontal check strategy
   */
  constructor(config: HorizontalCheckConfig) {
    this.config = config;
  }
  
  /**
   * Performs horizontal check to determine cached entity IDs and missing intervals.
   * @param intent - The intent specifying the target window and query parameters
   * @returns HorizontalResult containing cached IDs, missing intervals, and fetch flags
   */
  check(intent: NormalizedIntent): HorizontalResult {
    // If cache is disabled, return full missing interval
    if (!this.config.useCache) {
      return {
        windowIds: Array(intent.take).fill(null),
        missingIntervals: [[intent.skip, intent.skip + intent.take - 1]],
        needIdFetch: true
      };
    }
    
    // For now, return a basic implementation that assumes nothing is cached
    // This will be expanded when QueryBinding structures are fully implemented
    return {
      windowIds: Array(intent.take).fill(null),
      missingIntervals: [[intent.skip, intent.skip + intent.take - 1]],
      needIdFetch: true
    };
  }
}