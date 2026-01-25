import type {EntityConfigMap} from "./entity.ts";
import type {RelationConfigMap} from "./relation.ts";

export interface StoreConfig<
  TEntities extends EntityConfigMap<any>,
  TRelations extends RelationConfigMap<any, TEntities>
> {
  entities: TEntities;
  
  relations?: TRelations;
  
  options?: {};
}
