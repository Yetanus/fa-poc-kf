import type { SourceError } from '../../core/api/graphql-client';
import type { NewsItemFieldsFragment, NewsSource } from '../../graphql/generated/graphql';

export type FeedItem = NewsItemFieldsFragment;

export interface FeedFilters {
  readonly search: string;
  readonly sources: readonly NewsSource[];
  readonly tags: readonly string[];
}

export interface FeedPageResult {
  readonly items: FeedItem[];
  readonly endCursor: string | null;
  readonly hasNextPage: boolean;
  readonly sourceErrors: SourceError[];
}
