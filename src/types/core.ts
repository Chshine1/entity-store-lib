/**
 * Base entity interface that all entities must extend.
 */
export interface BaseEntity {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;
}