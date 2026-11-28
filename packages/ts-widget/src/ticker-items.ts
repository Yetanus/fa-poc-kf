import type { NewsSource, TickerItem } from '@fa/contracts';

export const SOURCE_LABELS: Record<NewsSource, string> = {
  HACKER_NEWS: 'Hacker News',
  SPACEFLIGHT: 'Spaceflight',
  DEV_TO: 'Dev.to',
};

function isNewsSource(value: unknown): value is NewsSource {
  return value === 'HACKER_NEWS' || value === 'SPACEFLIGHT' || value === 'DEV_TO';
}

export function isTickerItem(value: unknown): value is TickerItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'title' in value &&
    typeof value.title === 'string' &&
    'publishedAt' in value &&
    typeof value.publishedAt === 'string' &&
    'source' in value &&
    isNewsSource(value.source)
  );
}
