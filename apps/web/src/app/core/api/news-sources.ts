import type { NewsSource } from '../../graphql/generated/graphql';

export const NEWS_SOURCES: readonly NewsSource[] = ['HACKER_NEWS', 'SPACEFLIGHT', 'DEV_TO'];

export function isNewsSource(value: unknown): value is NewsSource {
  return NEWS_SOURCES.some((source) => source === value);
}
