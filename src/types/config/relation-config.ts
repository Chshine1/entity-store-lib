/**
 * Configuration for a relation between entities.
 * Defines the connection between two different entity types.
 *
 * @template KRelation - Unique name for the relation.
 * @template KSource - Name of the source entity type.
 * @template KTarget - Name of the target entity type.
 */
export interface RelationConfig<
  KRelation extends string,
  KSource extends string,
  KTarget extends string
> {
  /** Unique identifier for the relation */
  key: KRelation;
  /** The entity type that originates the relation */
  sourceEntityKey: KSource;
  /** The entity type that is the target of the relation */
  targetEntityKey: KTarget;
}