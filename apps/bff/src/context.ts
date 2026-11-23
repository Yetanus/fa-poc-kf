import type { GraphQLError } from 'graphql';
import type { YogaInitialContext } from 'graphql-yoga';
import { createHackerNews } from './adapters/index.js';
import type { HackerNewsAdapter } from './adapters/hacker-news/hacker-news.adapter.js';

export interface GraphQLContext extends YogaInitialContext {
  hackerNews: HackerNewsAdapter;
  upstreamErrors: GraphQLError[];
}

export function createContext() {
  return {
    hackerNews: createHackerNews(),
    upstreamErrors: [] as GraphQLError[],
  };
}
