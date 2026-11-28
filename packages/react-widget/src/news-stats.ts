import type { NewsItem, NewsSource } from '@fa/contracts';

const SOURCES: readonly NewsSource[] = ['HACKER_NEWS', 'SPACEFLIGHT', 'DEV_TO'];

export const SOURCE_LABELS: Record<NewsSource, string> = {
  HACKER_NEWS: 'Hacker News',
  SPACEFLIGHT: 'Spaceflight News',
  DEV_TO: 'Dev.to',
};

export interface SourceCount {
  source: NewsSource;
  count: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface DayCount {
  day: Date;
  count: number;
}

export interface NewsStats {
  total: number;
  sources: SourceCount[];
  tags: TagCount[];
  days: DayCount[];
}

const TIMELINE_DAYS = 7;

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function computeStats(items: readonly NewsItem[]): NewsStats {
  const bySource = items.reduce<Record<NewsSource, number>>(
    (counts, item) => {
      counts[item.source] += 1;
      return counts;
    },
    { HACKER_NEWS: 0, SPACEFLIGHT: 0, DEV_TO: 0 },
  );

  const byTag = items.reduce((counts, item) => {
    item.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    return counts;
  }, new Map<string, number>());

  const byDay = items.reduce((counts, item) => {
    const day = startOfDay(new Date(item.publishedAt));
    counts.set(day, (counts.get(day) ?? 0) + 1);
    return counts;
  }, new Map<number, number>());

  // the chart ends on the newest item's day, not on "today"
  const last = new Date(Math.max(0, ...byDay.keys()));
  const days = Array.from({ length: TIMELINE_DAYS }, (_, index) => {
    const day = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() - (TIMELINE_DAYS - 1 - index),
    );
    return { day, count: byDay.get(day.getTime()) ?? 0 };
  });

  return {
    total: items.length,
    sources: SOURCES.map((source) => ({ source, count: bySource[source] })).filter(
      ({ count }) => count > 0,
    ),
    tags: [...byTag]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag)),
    days,
  };
}
