import { DateTimeResolver } from 'graphql-scalars';
import type { NewsSource } from '@fa/contracts';
import type { Resolvers } from './generated/resolvers.js';
import { config } from './config.js';
import { SpaceflightAdapter } from './adapters/spaceflight/spaceflight.adapter.js';
import { DevToAdapter } from './adapters/dev-to/dev-to.adapter.js';
import { aggregateFeed } from './aggregator.js';

const ALL_SOURCES: NewsSource[] = ['HACKER_NEWS', 'SPACEFLIGHT', 'DEV_TO'];

const spaceflight = new SpaceflightAdapter(config.SPACEFLIGHT_API_URL);
const devTo = new DevToAdapter(config.DEV_TO_API_URL);

export const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    feed: async (_parent, { filter, first, after }, { hackerNews, upstreamErrors }) => {
      const result = await aggregateFeed([hackerNews, spaceflight, devTo], {
        sources: filter?.sources ?? ALL_SOURCES,
        search: filter?.search?.trim() || undefined,
        tags: filter?.tags ?? [],
        first,
        after: after ?? null,
      });
      upstreamErrors.push(...result.errors);

      return {
        edges: result.items.map((node) => ({ cursor: node.id, node })),
        pageInfo: { hasNextPage: result.nextCursor !== null, endCursor: result.nextCursor },
      };
    },
    item: async (_parent, { id }, { hackerNews }) => {
      const [source, nativeId] = id.split(':');
      if (!nativeId) return null;

      switch (source) {
        case 'SPACEFLIGHT':
          return spaceflight.fetchById(nativeId);
        case 'HACKER_NEWS':
          return hackerNews.fetchById(nativeId);
        case 'DEV_TO':
          return devTo.fetchById(nativeId);
        default:
          return null;
      }
    },
  },
  NewsItem: {
    author: async (item, _args, { hackerNews }) => {
      if (!item.authorName) return null;

      if (item.source === 'HACKER_NEWS') {
        const user = await hackerNews.loadUser(item.authorName);
        return {
          name: item.authorName,
          profileUrl: `https://news.ycombinator.com/user?id=${item.authorName}`,
          karma: user?.karma ?? null,
        };
      }
      return { name: item.authorName, profileUrl: null, karma: null };
    },
  },
};
