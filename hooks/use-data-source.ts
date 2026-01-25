import {useStore} from 'zustand';
import type {StoreApi} from 'zustand';
import type {BaseEntity, DataSourceStore} from "../src/types";

export const useDataSource = <
  TEntities extends Record<string, BaseEntity>
>(
  store: StoreApi<DataSourceStore<TEntities>>,
  selector?: (state: DataSourceStore<TEntities>) => any
) => {
  if (selector) {
    return useStore(store, selector);
  }
  
  return useStore(store);
};

export const createDataSourceHook = <
  TEntities extends Record<string, BaseEntity>
>(
  store: StoreApi<DataSourceStore<TEntities>>
) => {
  return <TSelected = DataSourceStore<TEntities>>(
    selector?: (state: DataSourceStore<TEntities>) => TSelected
  ) => useDataSource(store, selector);
};