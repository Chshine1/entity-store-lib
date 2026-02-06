import type {Operation} from "./common.ts";
import type {EntitiesRecord} from "../entity.ts";
import type {RelationsRecord} from "../relation.ts";

export type IntentUnit<
  TEntities extends EntitiesRecord,
  TRelations extends RelationsRecord,
  KEntity extends keyof TEntities,
> = {
  entityKey: KEntity;
  operations: Operation<TEntities, TRelations, KEntity>[];
};

export type IntentUnitsRecord = Record<string, IntentUnit<any, any, any>>;