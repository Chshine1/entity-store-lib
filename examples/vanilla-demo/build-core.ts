import {UnifiedConfigBuilder} from "../../src/core/builders";
import {type BaseEntity} from "../../src/types";

interface UserEntity extends BaseEntity {
  name: string;
  email: string;
  age: number;
}

interface PostEntity extends BaseEntity {
  title: string;
  content: string;
  authorId: string;
}

interface CommentEntity extends BaseEntity {
  text: string;
  postId: string;
  userId: string;
}

export const core = UnifiedConfigBuilder.create()
  .addEntity<'user', UserEntity>({
    key: 'user',
    defaultValues: {name: '', email: '', age: 0},
    generateId: () => `user_${Math.random().toString(36).substring(2, 9)}`,
  })
  .addEntity<'post', PostEntity>({
    key: 'post',
    defaultValues: {title: '', content: '', authorId: ''},
    generateId: () => `post_${Math.random().toString(36).substring(2, 9)}`,
  })
  .addEntity<'comment', CommentEntity>({
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
