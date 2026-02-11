import {core} from "./build-core";

export const userIntent = core
  .createIntent()
  .attachEntityIntent('test-user', 'user')
  .select(['name', 'age'])
  .orderBy('name', 'desc')
  .skip(10)
  .take(10)
  .include('userPosts', core.createIntent().attachEntityIntent('userPosts', 'post'))
  .orderBy('userPosts', 'asc')
  .build();

export const countUserIntent = userIntent
  .attachUnitIntent('test-user-count', 'test-user')
  .where('age', 'lte', 20)
  .aggregate('age', 'sum')
  .build()
