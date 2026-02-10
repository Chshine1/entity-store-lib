import React, {createContext, useCallback, useContext} from 'react';
import type {UnifiedConfig} from "@/types";
import type {EntityCore} from "@/core/entity-core.ts";

export function createEntityCoreContext<TConfig extends UnifiedConfig>(core: EntityCore<TConfig>) {
  const EntityCoreContext = createContext<EntityCore<TConfig> | null>(null);
  
  const EntityCoreProvider: React.FC<{
    children: React.ReactNode;
  }> = ({children}) => {
    return (
      <EntityCoreContext.Provider value={core}>
        {children}
      </EntityCoreContext.Provider>
    );
  };
  
  const useEntityCore = () => {
    const c = useContext(EntityCoreContext);
    if (!c) {
      throw new Error('useEntityCore must be used within EntityCoreProvider');
    }
    return c;
  };
  
  const useIntent = () => {
    const core = useEntityCore();
    
    const createIntent = useCallback(() => {
      return core.createIntent();
    }, [core]);
    
    return {createIntent};
  };
  
  return {
    EntityCoreProvider,
    useEntityCore,
    useIntent
  };
}