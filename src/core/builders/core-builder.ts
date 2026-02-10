import type {BaseEntity, EntityConfig, RelationConfig} from "@/types";
import {EntityCore} from "../entity-core.ts";

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
    config: KEntity extends keyof TEntityConfigs ? never : EntityConfig<KEntity, TEntity>
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
    KRelation extends string,
    KSource extends keyof TEntityConfigs & string,
    KTarget extends keyof TEntityConfigs & string,
  >(
    config: KRelation extends keyof TRelationConfigs ? never : RelationConfig<KRelation, KSource, KTarget>
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
  
  build(): EntityCore<{
    entities: TEntityConfigs;
    relations: TRelationConfigs;
  }> {
    return new EntityCore({
      entities: this.entityConfigs,
      relations: this.relationConfigs
    });
  }
}

export const config = UnifiedConfigBuilder.create()
  .addEntity<'user', BaseEntity>({
    key: 'user',
    defaultValues: {name: '', email: '', age: 0},
    generateId: () => `user_${Math.random().toString(36).substring(2, 9)}`,
  })
  .addEntity<'post', BaseEntity>({
    key: 'post',
    defaultValues: {title: '', content: '', authorId: ''},
    generateId: () => `post_${Math.random().toString(36).substring(2, 9)}`,
  })
  .addEntity<'comment', BaseEntity>({
    key: 'comment',
    defaultValues: {text: '', postId: '', userId: ''},
  })
  .addRelation<'userPosts', 'user', 'post'>({
    key: 'userPosts',
    sourceEntityKey: 'user',
    targetEntityKey: 'post',
  })
  .addRelation<'postComments', 'post', 'comment'>({
    key: 'postComments',
    sourceEntityKey: 'post',
    targetEntityKey: 'comment',
  })
  .addRelation<'userComments', 'user', 'comment'>({
    key: 'userComments',
    sourceEntityKey: 'user',
    targetEntityKey: 'comment'
  })
  .build();