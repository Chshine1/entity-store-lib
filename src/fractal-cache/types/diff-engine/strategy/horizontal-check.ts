import type {Intent} from "@/fractal-cache/types/intent-parser.ts";
import type {IQueryBindingStore} from "@/fractal-cache/types/query-binding-store.ts";
import type {HorizontalResult} from "@/fractal-cache/types/diff-engine";

export interface HorizontalCheckStrategy {
  check(intent: Intent, bindingStore: IQueryBindingStore): HorizontalResult;
}