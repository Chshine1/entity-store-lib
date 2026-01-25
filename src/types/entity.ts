export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EntityConfig<TEntity extends BaseEntity> {
  name: string;
  defaultValues?: Partial<Omit<TEntity, keyof BaseEntity>>;
  generateId?: () => string;
}

export type EntityConfigMap<T extends Record<string, EntityConfig<any>>> = {
  [K in keyof T]: Extract<
    T[K],
    { name: K }
  > extends EntityConfig<any>
    ? T[K]
    : never;
};
