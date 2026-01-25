import type {EntityConfig, BaseEntity} from "../src/types";
import type {RelationConfig} from "../src/types";

interface UserEntity extends BaseEntity {
  username: string;
}

interface PostEntity extends BaseEntity {
  title: string;
  content: string;
}

type EntitiesConfig = {
  user: EntityConfig<"user", UserEntity>;
  post: EntityConfig<"post", PostEntity>;
}

const userPostsConfig: RelationConfig<"userPosts", "user", "post"> = {
  name: "userPosts",
  sourceType: "user",
  targetType: "post",
}

type RelationsConfig = {
  userPosts: RelationConfig<"userPosts", "user", "post">;
};