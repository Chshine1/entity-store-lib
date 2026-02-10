import type {BaseEntity, EntityConfig, RelationConfig, UnifiedConfig} from "@/types";

type AvailableEntityKey<K extends string, TEntityConfigs extends Record<string, EntityConfig<any, any>>>
  = K extends keyof TEntityConfigs ? never : K;

type AvailableRelationKey<K extends string, TRelationConfigs extends Record<string, RelationConfig<any, any, any>>>
  = K extends keyof TRelationConfigs ? never : K;

export class UnifiedConfigBuilder<
  TEntityKeys extends string,
  TEntityConfigs extends { [K in TEntityKeys]: EntityConfig<K, any> },
  TRelationKeys extends string,
  TRelationConfigs extends { [K in TRelationKeys]: RelationConfig<K, any, any> }
> {
  private readonly entityConfigs: TEntityConfigs;
  private readonly relationConfigs: TRelationConfigs;
  
  constructor(entityConfigs: TEntityConfigs, relationConfigs: TRelationConfigs) {
    this.entityConfigs = entityConfigs;
    this.relationConfigs = relationConfigs;
  }
  
  static create(): UnifiedConfigBuilder<never, {}, never, {}> {
    return new UnifiedConfigBuilder({}, {});
  }
  
  addEntity<
    KEntity extends string,
    TEntity extends BaseEntity
  >(
    config: EntityConfig<AvailableEntityKey<KEntity, TEntityConfigs>, TEntity>
  ): UnifiedConfigBuilder<
    TEntityKeys | KEntity,
    { [K in TEntityKeys | KEntity]: EntityConfig<K, TEntity> },
    TRelationKeys,
    TRelationConfigs
  > {
    const entityConfigs = {
      ...this.entityConfigs,
      [config.key]: config
    } as { [K in TEntityKeys | KEntity]: EntityConfig<K, TEntity> };
    
    return new UnifiedConfigBuilder(entityConfigs, this.relationConfigs);
  }
  
  addRelation<
    KRelation extends Exclude<string, keyof TRelationConfigs>,
    KSource extends keyof TEntityConfigs & string,
    KTarget extends keyof TEntityConfigs & string,
  >(
    config: RelationConfig<AvailableRelationKey<KRelation, TRelationConfigs>, KSource, KTarget>
  ): UnifiedConfigBuilder<
    TEntityKeys,
    TEntityConfigs,
    TRelationKeys | KRelation,
    { [K in TRelationKeys | KRelation]: RelationConfig<K, any, any>; }
  > {
    const relationConfigs = {
      ...this.relationConfigs,
      [config.key]: config,
    } as { [K in TRelationKeys | KRelation]: RelationConfig<K, any, any>; };
    
    return new UnifiedConfigBuilder(this.entityConfigs, relationConfigs);
  }
  
  build(): UnifiedConfig {
    return {
      entities: this.entityConfigs,
      relations: this.relationConfigs,
    };
  }
}

export const config = UnifiedConfigBuilder.create()
  .addEntity({
    key: 'user',
    defaultValues: {name: '', email: '', age: 0},
    generateId: () => `user_${Math.random().toString(36).substring(2, 9)}`,
  })
  .addEntity({
    key: 'post',
    defaultValues: {title: '', content: '', authorId: ''},
    generateId: () => `post_${Math.random().toString(36).substring(2, 9)}`,
  })
  .addEntity({
    key: 'comment',
    defaultValues: {text: '', postId: '', userId: ''},
  })
  .addRelation({
    key: 'userPosts',
    sourceEntityKey: 'user',
    targetEntityKey: 'post',
  })
  .addRelation({
    key: 'postComments',
    sourceEntityKey: 'post',
    targetEntityKey: 'comment',
  })
  .addRelation({
    key: 'userComments',
    sourceEntityKey: 'user',
    targetEntityKey: 'comment'
  })
  .build();