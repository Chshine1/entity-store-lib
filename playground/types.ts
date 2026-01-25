import type {EntityConfig, BaseEntity, EntityConfigMap} from "../src/types/entity";
import type {RelationConfig, RelationConfigMap} from "../src/types/relation";
import type {StoreConfig} from "../src/types/store";

interface UserEntity extends BaseEntity {
  username: string;
}

const userConfig: EntityConfig<UserEntity> = {
  name: "user"
} as const;

interface PostEntity extends BaseEntity {
  title: string;
  content: string;
}

const postConfig: EntityConfig<PostEntity> = {
  name: "post",
} as const;

type Entities = EntityConfigMap<{
  user: EntityConfig<UserEntity>;
  post: EntityConfig<PostEntity>;
}>;

const entitiesConfig: Entities = {
  user: userConfig,
  post: postConfig,
} as const;

const userPostsConfig: RelationConfig<Entities, "user", "post"> = {
  name: "userPosts",
  sourceType: "user",
  targetType: "post",
}

type Relations = RelationConfigMap<{
  userPosts: RelationConfig<Entities, "user", "post">;
}, Entities>;

const relationsConfig: Relations = {
  userPosts: userPostsConfig
} as const;

export const storeConfig: StoreConfig<Entities, Relations> = {
  entities: entitiesConfig,
  relations: relationsConfig
} as const;