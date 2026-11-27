import type { ParamMap, Params } from '@angular/router';
import { NEWS_SOURCES, isNewsSource } from '../../core/api/news-sources';
import type { FeedFilters } from './feed.models';

export function normalizeTag(value: string): string {
  return value.trim().replace(/^#/, '').toLowerCase();
}

export function filtersFromParams(params: ParamMap): FeedFilters {
  const sources = params.getAll('sources').filter(isNewsSource);
  const tags = params
    .getAll('tags')
    .map(normalizeTag)
    .filter((tag) => tag !== '');

  return {
    search: params.get('q')?.trim() ?? '',
    sources:
      sources.length > 0 ? NEWS_SOURCES.filter((source) => sources.includes(source)) : NEWS_SOURCES,
    tags: [...new Set(tags)],
  };
}

export function filtersToParams(filters: FeedFilters): Params {
  return {
    q: filters.search || null,
    sources: filters.sources.length < NEWS_SOURCES.length ? filters.sources : null,
    tags: filters.tags.length > 0 ? filters.tags : null,
  };
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, i) => value === b[i]);
}

export function sameFilters(a: FeedFilters, b: FeedFilters): boolean {
  return a.search === b.search && sameList(a.sources, b.sources) && sameList(a.tags, b.tags);
}
