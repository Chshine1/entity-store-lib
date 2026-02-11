import type {BaseEntity, EntityConfig, RelationConfig} from "@/types";
import {EntityCore} from "../entity-core.ts";

export class UnifiedConfigBuilder<
  TEntities extends Record<string, EntityConfig<any, any>>,
  TRelations extends Record<string, RelationConfig<any, any, any>>
> {
  private readonly entityConfigs: TEntities;
  private readonly relationConfigs: TRelations;
  
  constructor(entityConfigs: TEntities, relationConfigs: TRelations) {
    this.entityConfigs = entityConfigs;
    this.relationConfigs = relationConfigs;
  }
  
  static create(): UnifiedConfigBuilder<{}, {}> {
    return new UnifiedConfigBuilder({}, {});
  }
  
  addEntity<
    KEntity extends string,
    TEntity extends BaseEntity
  >(
    config: KEntity extends keyof TEntities ? never : EntityConfig<KEntity, TEntity>
  ): UnifiedConfigBuilder<
    TEntities & { [K in KEntity]: EntityConfig<KEntity, TEntity> },
    TRelations
  > {
    const entityConfigs = {
      ...this.entityConfigs,
      [config.key]: config
    } as TEntities & { [K in KEntity]: EntityConfig<KEntity, TEntity> };
    
    return new UnifiedConfigBuilder(entityConfigs, this.relationConfigs);
  }
  
  addRelation<
    KRelation extends string,
    KSource extends keyof TEntities & string,
    KTarget extends keyof TEntities & string,
  >(
    config: KRelation extends keyof TRelations ? never : RelationConfig<KRelation, KSource, KTarget>
  ): UnifiedConfigBuilder<
    TEntities,
    TRelations & { [K in KRelation]: RelationConfig<KRelation, KSource, KTarget> }
  > {
    const relationConfigs = {
      ...this.relationConfigs,
      [config.key]: config,
    } as TRelations & { [K in KRelation]: RelationConfig<KRelation, KSource, KTarget> };
    
    return new UnifiedConfigBuilder(this.entityConfigs, relationConfigs);
  }
  
  build(): EntityCore<{
    entities: TEntities;
    relations: TRelations;
  }> {
    return new EntityCore({
      entities: this.entityConfigs,
      relations: this.relationConfigs
    });
  }
}