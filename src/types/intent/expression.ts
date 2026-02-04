export interface IntentExpression<TResult> {
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
  | { type: 'include'; relation: string; subExpr: IntentExpression<any> }
  | { type: 'aggregate'; initial: any; accumulatorId: string; resultPath: string };

export const EMPTY_EXPRESSION: IntentExpression<never> = {
  resultType: undefined as never,
  steps: [],
  meta: {entityKey: ''}
};