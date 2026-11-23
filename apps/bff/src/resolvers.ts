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
    feed: async (_parent, { filter, first }, { hackerNews }) => {
      const sources = filter?.sources ?? ALL_SOURCES;
      const search = filter?.search ?? undefined;
      const page = { limit: first, offset: 0, search };

      const [fromSpaceflight, fromHackerNews] = await Promise.all([
        sources.includes('SPACEFLIGHT') ? spaceflight.fetchPage(page) : null,
        sources.includes('HACKER_NEWS') ? hackerNews.fetchPage(page) : null,
      ]);
      const fromFixtures = newsFixtures.filter((item) => sources.includes(item.source));

      const all = [
        ...fromFixtures,
        ...(fromSpaceflight?.items ?? []),
        ...(fromHackerNews?.items ?? []),
      ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      const items = all.slice(0, first);

      return {
        edges: items.map((node) => ({ cursor: node.id, node })),
        pageInfo: { hasNextPage: all.length > first, endCursor: items.at(-1)?.id ?? null },
      };
    },
    item: async (_parent, { id }, { hackerNews }) => {
      const [source, nativeId] = id.split(':');
      if (source === 'SPACEFLIGHT' && nativeId) {
        return spaceflight.fetchById(nativeId);
      }
      if (source === 'HACKER_NEWS' && nativeId) {
        return hackerNews.fetchById(nativeId);
      }
      return newsFixtures.find((item) => item.id === id) ?? null;
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
