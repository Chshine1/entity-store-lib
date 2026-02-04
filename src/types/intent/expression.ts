export interface IntentUnit<TResult> {
  resultType: TResult;
  steps: QueryStep[];
  meta: {
    entityKey: string;
    relationPath?: string[];
  };
}

export type QueryStep =
  | { type: 'where'; field: string; operator: string; value: any; valueType: any }
  | { type: 'orderBy'; field: string; direction: 'asc' | 'desc' }
  | { type: 'skip'; count: number }
  | { type: 'take'; count: number }
  | { type: 'select'; selectorId: string }
  | { type: 'include'; relation: string; subExpr: IntentUnit<any> }
  | { type: 'aggregate'; initial: any; accumulatorId: string; resultPath: string };

export const EMPTY_EXPRESSION: IntentUnit<never> = {
  resultType: undefined as never,
  steps: [],
  meta: {entityKey: ''}
};

export type IntentUnitsRecord = Record<string, IntentUnit<any>>;