export type RelatedResult<
  TEntities extends Record<string, BaseEntity>,
  TName extends string,
  TRelationMap extends Record<string, { sourceType: keyof TEntities; targetType: keyof TEntities }>,
  TTargetType extends keyof TEntities
> = TName extends keyof TRelationMap
  ? TRelationMap[TName]['targetType'] extends TTargetType
    ? TEntities[TTargetType][]
    : never
  : TEntities[TTargetType][];

export interface StoreState<
  TEntities extends Record<string, BaseEntity>,
  TRelationMap extends Record<string, { sourceType: keyof TEntities; targetType: keyof TEntities }>
> {
  entities: {
    [K in keyof TEntities]: {
      byId: Map<string, TEntities[K]>;
    };
  };
  
  /** relationName -> sourceId -> targetId[] */
  relations: Map<string, Map<string, string[]>>;
}

export interface EntityStore<
  TEntities extends Record<string, BaseEntity>,
  TRelations extends RelationConfig<any, any>[] = [],
  TRelationMap extends RelationMap<TEntities, TRelations> = RelationMap<TEntities, TRelations>
> {
  load: <K extends keyof TEntities>(
    entityType: K,
    data: TEntities[K],
  ) => boolean;
  
  create: <K extends keyof TEntities>(
    entityType: K,
    data: Omit<TEntities[K], keyof BaseEntity>
  ) => TEntities[K];
  
  update: <K extends keyof TEntities>(
    entityType: K,
    id: string,
    data: Partial<Omit<TEntities[K], keyof BaseEntity>>
  ) => TEntities[K] | undefined;
  
  remove: <K extends keyof TEntities>(entityType: K, id: string) => boolean;
  
  get: <K extends keyof TEntities>(entityType: K, id: string) => TEntities[K] | undefined;
  
  getAll: <K extends keyof TEntities>(entityType: K) => TEntities[K][];
  
  relate: <
    TRelationName extends keyof TRelationMap & string,
    TSource extends TRelationMap[TRelationName]['sourceType'],
    TTarget extends TRelationMap[TRelationName]['targetType']
  >(
    relationName: TRelationName,
    sourceType: TSource,
    sourceId: string,
    targetType: TTarget,
    targetId: string
  ) => void;
  
  unrelate: <
    TRelationName extends keyof TRelationMap & string,
    TSource extends TRelationMap[TRelationName]['sourceType']
  >(
    relationName: TRelationName,
    sourceType: TSource,
    sourceId: string,
    targetId?: string
  ) => void;
  
  getRelated: <
    TRelationName extends keyof TRelationMap & string,
    TSource extends TRelationMap[TRelationName]['sourceType'],
    TTarget extends TRelationMap[TRelationName]['targetType']
  >(
    relationName: TRelationName,
    sourceId: string,
    targetType?: TTarget
  ) => TEntities[TTarget][];
  
  findFirst: <K extends keyof TEntities>(
    entityType: K,
    predicate: (entity: TEntities[K]) => boolean
  ) => TEntities[K] | undefined;
  
  findAll: <K extends keyof TEntities>(
    entityType: K,
    predicate: (entity: TEntities[K]) => boolean
  ) => TEntities[K][];
  
  cache: {
    set: (key: string, data: any, ttl?: number) => void;
    get: <T = any>(key: string) => T | undefined;
    remove: (key: string) => void;
    clear: () => void;
  };
  
  batch: {
    addMany: <K extends keyof TEntities>(
      entityType: K,
      items: Array<Omit<TEntities[K], 'id'> & { id?: string }>
    ) => TEntities[K][];
    
    updateMany: <K extends keyof TEntities>(
      entityType: K,
      updates: Array<{ id: string; data: Partial<TEntities[K]> }>
    ) => Array<TEntities[K] | undefined>;
  };
  
  clear: () => void;
  snapshot: () => StoreState<TEntities, TRelationMap>;
  restore: (snapshot: StoreState<TEntities, TRelationMap>) => void;
}