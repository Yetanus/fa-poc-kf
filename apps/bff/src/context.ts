import type { GraphQLError } from 'graphql';
import type { YogaInitialContext } from 'graphql-yoga';
import { createHackerNews } from './adapters/index.js';
import type { HackerNewsAdapter } from './adapters/hacker-news/hacker-news.adapter.js';
import { authenticate, type AuthUser } from './auth.js';

export interface GraphQLContext extends YogaInitialContext {
  hackerNews: HackerNewsAdapter;
  upstreamErrors: GraphQLError[];
  user: AuthUser | null;
}

export async function createContext({ request }: YogaInitialContext) {
  return {
    hackerNews: createHackerNews(),
    upstreamErrors: [] as GraphQLError[],
    user: await authenticate(request),
  };
}
