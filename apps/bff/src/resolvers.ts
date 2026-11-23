import { DateTimeResolver } from 'graphql-scalars';
import type { NewsSource } from '@fa/contracts';
import type { Resolvers } from './generated/resolvers.js';
import { newsFixtures } from './fixtures/news.js';
import { config } from './config.js';
import { SpaceflightAdapter } from './adapters/spaceflight/spaceflight.adapter.js';

const ALL_SOURCES: NewsSource[] = ['HACKER_NEWS', 'SPACEFLIGHT', 'HASHNODE'];

const spaceflight = new SpaceflightAdapter(config.SPACEFLIGHT_API_URL);

export const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    feed: async (_parent, { filter, first }) => {
      const sources = filter?.sources ?? ALL_SOURCES;
      const fromFixtures = newsFixtures.filter((item) => sources.includes(item.source));

      const fromSpaceflight = sources.includes('SPACEFLIGHT')
        ? (
            await spaceflight.fetchPage({
              limit: first,
              offset: 0,
              search: filter?.search ?? undefined,
            })
          ).items
        : [];

      const all = [...fromFixtures, ...fromSpaceflight].sort((a, b) =>
        b.publishedAt.localeCompare(a.publishedAt),
      );
      const items = all.slice(0, first);

      return {
        edges: items.map((node) => ({ cursor: node.id, node })),
        pageInfo: { hasNextPage: all.length > first, endCursor: items.at(-1)?.id ?? null },
      };
    },
    item: async (_parent, { id }) => {
      const [source, nativeId] = id.split(':');
      if (source === 'SPACEFLIGHT' && nativeId) {
        return spaceflight.fetchById(nativeId);
      }
      return newsFixtures.find((item) => item.id === id) ?? null;
    },
  },
};
