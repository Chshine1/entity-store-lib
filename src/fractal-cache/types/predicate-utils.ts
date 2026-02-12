import type {FilterAST} from "@/fractal-cache/core.ts";

export interface IPredicateUtils {
  isSubset(astA: FilterAST, astB: FilterAST): boolean;
  
  isSuperset(astA: FilterAST, astB: FilterAST): boolean;
  
  difference(astA: FilterAST, astB: FilterAST): FilterAST;
}