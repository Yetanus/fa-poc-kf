import type { GraphQLError } from 'graphql';
import type { YogaInitialContext } from 'graphql-yoga';
import { config } from './config.js';
import { HackerNewsAdapter } from './adapters/hacker-news/hacker-news.adapter.js';

export interface GraphQLContext extends YogaInitialContext {
  hackerNews: HackerNewsAdapter;
  upstreamErrors: GraphQLError[];
}

export function createContext() {
  return {
    hackerNews: new HackerNewsAdapter(config.HACKER_NEWS_API_URL, config.HACKER_NEWS_SEARCH_URL),
    upstreamErrors: [] as GraphQLError[],
  };
}
