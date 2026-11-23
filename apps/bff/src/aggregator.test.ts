import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Logger } from 'graphql-yoga';
import type { NewsItem, NewsSource } from '@fa/contracts';
import type { NewsAdapter } from './adapters/news-adapter.js';
import { UpstreamError } from './errors.js';
import fixtures from './__fixtures__/news-items.json' with { type: 'json' };

const items = fixtures as NewsItem[];
const log = new Logger({ level: false });
const ALL: NewsSource[] = ['HACKER_NEWS', 'SPACEFLIGHT', 'DEV_TO'];

function fakeAdapter(source: NewsSource, fail = false): NewsAdapter {
  return {
    source,
    fetchPage: () =>
      fail
        ? Promise.reject(new UpstreamError(source, 'HTTP 503', 503))
        : Promise.resolve({ items: items.filter((i) => i.source === source), hasMore: false }),
    fetchById: () => Promise.resolve(null),
  };
}

const request = { sources: ALL, search: undefined, tags: [], first: 9, after: null };

describe('aggregateFeed', () => {
  let aggregateFeed: typeof import('./aggregator.js').aggregateFeed;

  beforeEach(async () => {
    // fresh module so the page cache is empty
    vi.resetModules();
    ({ aggregateFeed } = await import('./aggregator.js'));
  });

  it('sorts items from all sources by date', async () => {
    const adapters = ALL.map((s) => fakeAdapter(s));
    const result = await aggregateFeed(adapters, request, log);

    const dates = result.items.map((i) => i.publishedAt);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(result.items[0]?.id).toBe('SPACEFLIGHT:1');
  });

  it('removes duplicates with the same url', async () => {
    const adapters = ALL.map((s) => fakeAdapter(s));
    const result = await aggregateFeed(adapters, request, log);

    const ids = result.items.map((i) => i.id);
    expect(ids).toContain('HACKER_NEWS:1');
    expect(ids).not.toContain('DEV_TO:1');
    expect(ids).toContain('HACKER_NEWS:2');
  });

  it('returns other sources and an error when one source is down', async () => {
    const adapters = [
      fakeAdapter('HACKER_NEWS'),
      fakeAdapter('SPACEFLIGHT', true),
      fakeAdapter('DEV_TO'),
    ];
    const result = await aggregateFeed(adapters, request, log);

    expect(result.items.some((i) => i.source === 'SPACEFLIGHT')).toBe(false);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.extensions).toEqual({
      code: 'UPSTREAM_UNAVAILABLE',
      source: 'SPACEFLIGHT',
    });
  });

  it('filters by tag', async () => {
    const adapters = ALL.map((s) => fakeAdapter(s));
    const result = await aggregateFeed(adapters, { ...request, tags: ['SpaceX'] }, log);

    expect(result.items.map((i) => i.id)).toEqual(['SPACEFLIGHT:1']);
  });
});
