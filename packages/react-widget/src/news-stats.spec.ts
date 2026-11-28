import type { NewsItem } from '@fa/contracts';
import { describe, expect, it } from 'vitest';
import { computeStats } from './news-stats';

let nextId = 1;

function newsItem(source: NewsItem['source'], tags: string[], publishedAt: string): NewsItem {
  return {
    id: `${source}:${nextId++}`,
    source,
    title: 'title',
    url: null,
    summary: null,
    imageUrl: null,
    publishedAt,
    authorName: null,
    score: null,
    commentsCount: null,
    readTimeMinutes: null,
    tags,
  };
}

describe('computeStats', () => {
  it('counts sources, tags and the last 7 days', () => {
    const stats = computeStats([
      newsItem('HACKER_NEWS', ['b', 'a'], '2026-11-28T12:00:00Z'),
      newsItem('DEV_TO', ['b'], '2026-11-28T13:00:00Z'),
      newsItem('DEV_TO', ['c', 'b'], '2026-11-25T12:00:00Z'),
      newsItem('DEV_TO', [], '2026-11-01T12:00:00Z'),
    ]);

    expect(stats.total).toBe(4);
    expect(stats.sources).toEqual([
      { source: 'HACKER_NEWS', count: 1 },
      { source: 'DEV_TO', count: 3 },
    ]);
    expect(stats.tags).toEqual([
      { tag: 'b', count: 3 },
      { tag: 'a', count: 1 },
      { tag: 'c', count: 1 },
    ]);
    expect(stats.days.map(({ count }) => count)).toEqual([0, 0, 0, 1, 0, 0, 2]);
    expect(stats.days.at(-1)?.day.getDate()).toBe(28);
  });
});
