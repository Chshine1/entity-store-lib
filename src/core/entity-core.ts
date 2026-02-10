import type {UnifiedConfig} from "@/types";
import {Intent} from "./intent.ts";

export class EntityCore<TConfig extends UnifiedConfig> {
  // @ts-ignore
  private readonly config: TConfig;
  
  constructor(config: TConfig) {
    this.config = config;
  }
  
  createIntent(): Intent<TConfig, {}> {
    return new Intent({});
  }
}