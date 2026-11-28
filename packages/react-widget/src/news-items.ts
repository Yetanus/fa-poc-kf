import type { NewsItem, NewsSource } from '@fa/contracts';

function isNewsSource(value: unknown): value is NewsSource {
  return value === 'HACKER_NEWS' || value === 'SPACEFLIGHT' || value === 'DEV_TO';
}

export function isNewsItem(value: unknown): value is NewsItem {
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
    isNewsSource(value.source) &&
    'tags' in value &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string')
  );
}

export function toTags(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((tag) => typeof tag === 'string') : [];
}
