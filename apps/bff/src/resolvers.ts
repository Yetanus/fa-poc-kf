import { DateTimeResolver } from 'graphql-scalars';
import type { Resolvers } from './generated/resolvers.js';
import { newsFixtures } from './fixtures/news.js';

export const resolvers: Resolvers = {
  DateTime: DateTimeResolver,
  Query: {
    feed: (_parent, { filter, first }) => {
      const sources = filter?.sources;
      const all = newsFixtures
        .filter((item) => !sources || sources.includes(item.source))
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      const items = all.slice(0, first);

      return {
        edges: items.map((node) => ({ cursor: node.id, node })),
        pageInfo: { hasNextPage: all.length > first, endCursor: items.at(-1)?.id ?? null },
      };
    },
    item: (_parent, { id }) => newsFixtures.find((item) => item.id === id) ?? null,
  },
};
