import { GraphQLError } from 'graphql';
import { z } from 'zod';
import type { NewsItem, NewsSource } from '@fa/contracts';
import type { AdapterPage, NewsAdapter } from './adapters/news-adapter.js';
import { TtlCache } from './cache.js';
import type { Logger } from 'graphql-yoga';
import { ValidationError } from './errors.js';
import { logUpstreamError } from './logger.js';

export interface FeedRequest {
  sources: NewsSource[];
  search: string | undefined;
  tags: string[];
  first: number;
  after: string | null;
}

export interface FeedResult {
  items: NewsItem[];
  nextCursor: string | null;
  errors: GraphQLError[];
}

type Offsets = Partial<Record<NewsSource, number>>;

const cursorSchema = z.partialRecord(
  z.enum(['HACKER_NEWS', 'SPACEFLIGHT', 'DEV_TO']),
  z.number().int().min(0),
);

const pageCache = new TtlCache<string, AdapterPage>(60_000);

export function encodeCursor(offsets: Offsets): string {
  return Buffer.from(JSON.stringify(offsets)).toString('base64url');
}

export function decodeCursor(cursor: string): Offsets {
  try {
    return cursorSchema.parse(JSON.parse(Buffer.from(cursor, 'base64url').toString()));
  } catch {
    throw new ValidationError('Invalid cursor');
  }
}

export async function aggregateFeed(
  adapters: NewsAdapter[],
  req: FeedRequest,
  log: Logger,
): Promise<FeedResult> {
  const offsets: Offsets = req.after
    ? decodeCursor(req.after)
    : Object.fromEntries(req.sources.map((s) => [s, 0]));

  const active = adapters.filter(
    (a) => req.sources.includes(a.source) && offsets[a.source] !== undefined,
  );
  if (active.length === 0) return { items: [], nextCursor: null, errors: [] };

  // each source gets its share of the page, otherwise dev.to fills everything
  const limit = Math.ceil(req.first / active.length);

  const results = await Promise.allSettled(
    active.map((adapter) => {
      const offset = offsets[adapter.source] ?? 0;
      const key = `${adapter.source}:${limit}:${offset}:${req.search ?? ''}`;
      return pageCache.get(key, () => adapter.fetchPage({ limit, offset, search: req.search }));
    }),
  );

  const next: Offsets = {};
  const errors: GraphQLError[] = [];
  const items: NewsItem[] = [];

  results.forEach((result, i) => {
    const source = active[i]!.source;
    if (result.status === 'rejected') {
      logUpstreamError(log, source, result.reason);
      errors.push(toGraphQLError(source));
      next[source] = offsets[source] ?? 0;
      return;
    }
    items.push(...result.value.items);
    if (result.value.hasMore) next[source] = (offsets[source] ?? 0) + limit;
  });

  const seenUrls = new Set<string>();
  const merged = items
    .filter((item) => matchesTags(item, req.tags))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .filter((item) => {
      if (!item.url) return true;
      if (seenUrls.has(item.url)) return false;
      seenUrls.add(item.url);
      return true;
    });

  const hasNext = Object.keys(next).length > 0 && errors.length < active.length;
  return { items: merged, nextCursor: hasNext ? encodeCursor(next) : null, errors };
}

function matchesTags(item: NewsItem, tags: string[]): boolean {
  if (tags.length === 0) return true;
  return tags.some((tag) => item.tags.includes(tag.toLowerCase()));
}

function toGraphQLError(source: NewsSource): GraphQLError {
  return new GraphQLError(`${source} is unavailable`, {
    extensions: { code: 'UPSTREAM_UNAVAILABLE', source },
  });
}
