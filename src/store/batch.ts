import type {BatchResults, EntityOperationOptions} from "./common.ts";
import type {BaseEntity, EntityKeys, ExtractEntity, UnifiedConfig} from "@/types";

/**
 * Main entity store interface.
 */
export interface BatchActionsSlice<
  TConfig extends UnifiedConfig,
> {
  // Batch operations - now return detailed results
  createMany: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    data: Omit<ExtractEntity<TConfig, KEntity>, keyof BaseEntity>[],
    options?: EntityOperationOptions<TConfig>
  ) => BatchResults<ExtractEntity<TConfig, KEntity>>;
  
  updateMany: <KEntity extends EntityKeys<TConfig>>(
    entityKey: KEntity,
    updates: {
      id: string;
      data: Partial<Omit<ExtractEntity<TConfig, KEntity>, keyof BaseEntity>>;
    }[]
  ) => BatchResults<ExtractEntity<TConfig, KEntity>>;
}