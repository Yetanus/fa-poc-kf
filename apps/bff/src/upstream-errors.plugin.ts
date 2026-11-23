import { isAsyncIterable, type Plugin } from 'graphql-yoga';
import type { GraphQLContext } from './context.js';

export function useUpstreamErrors(): Plugin<GraphQLContext> {
  return {
    onExecute({ args }) {
      return {
        onExecuteDone({ result, setResult }) {
          const extra = args.contextValue.upstreamErrors;
          if (isAsyncIterable(result) || extra.length === 0) return;
          setResult({ ...result, errors: [...(result.errors ?? []), ...extra] });
        },
      };
    },
  };
}
