import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {IQueryBindingStore} from "@/fractal-cache/types/query-binding-store.ts";
import type {HorizontalCheckStrategy} from "@/fractal-cache/types/diff-engine/strategy/horizontal-check.ts";
import type {HorizontalResult} from "@/fractal-cache/types/diff-engine";

interface HorizontalCheckConfig {
  useCache: boolean;
  allowPartialCache: boolean;
  maxIntervalMergeGap: number;
}

export class DefaultHorizontalCheck implements HorizontalCheckStrategy {
  private readonly config: HorizontalCheckConfig;
  
  constructor(config: HorizontalCheckConfig) {
    this.config = config;
  }
  
  check(intent: Intent, _bindingStore: IQueryBindingStore): HorizontalResult {
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