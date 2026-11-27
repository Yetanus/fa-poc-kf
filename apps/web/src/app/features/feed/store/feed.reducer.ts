import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import type { SourceError } from '../../../core/api/graphql-client';
import { NEWS_SOURCES } from '../../../core/api/news-sources';
import type { FeedFilters, FeedItem } from '../feed.models';
import { FeedActions, FeedApiActions } from './feed.actions';

export type FeedStatus = 'idle' | 'loading' | 'loadingMore' | 'loaded' | 'error';

export interface FeedState extends EntityState<FeedItem> {
  filters: FeedFilters;
  status: FeedStatus;
  error: string | null;
  endCursor: string | null;
  hasNextPage: boolean;
  sourceErrors: SourceError[];
}

export const feedAdapter = createEntityAdapter<FeedItem>({
  sortComparer: (a, b) => b.publishedAt.localeCompare(a.publishedAt),
});

export const initialFeedState: FeedState = feedAdapter.getInitialState({
  filters: { search: '', sources: NEWS_SOURCES, tags: [] },
  status: 'idle',
  error: null,
  endCursor: null,
  hasNextPage: false,
  sourceErrors: [],
});

function matchesFilters(item: FeedItem, filters: FeedFilters): boolean {
  if (!filters.sources.includes(item.source)) {
    return false;
  }
  return filters.tags.length === 0 || filters.tags.some((tag) => item.tags.includes(tag));
}

export const feedFeature = createFeature({
  name: 'feed',
  reducer: createReducer(
    initialFeedState,
    on(FeedActions.opened, (state): FeedState => ({
      ...state,
      status: 'loading',
      error: null,
      endCursor: null,
      hasNextPage: false,
    })),
    on(FeedActions.nextPageRequested, (state): FeedState =>
      state.hasNextPage && state.status === 'loaded' ? { ...state, status: 'loadingMore' } : state,
    ),
    on(FeedApiActions.pageLoaded, (state, { page, append }): FeedState => {
      const next: FeedState = {
        ...state,
        status: 'loaded',
        error: null,
        endCursor: page.endCursor,
        hasNextPage: page.hasNextPage,
        sourceErrors: page.sourceErrors,
      };
      return append
        ? feedAdapter.upsertMany(page.items, next)
        : feedAdapter.setAll(page.items, next);
    }),
    on(FeedApiActions.pageFailed, (state, { error }): FeedState => ({
      ...state,
      status: 'error',
      error,
    })),
  ),
  extraSelectors: ({ selectFeedState, selectFilters, selectStatus }) => {
    const { selectAll } = feedAdapter.getSelectors(selectFeedState);

    return {
      selectAllItems: selectAll,
      selectVisibleItems: createSelector(selectAll, selectFilters, (items, filters) =>
        items.filter((item) => matchesFilters(item, filters)),
      ),
      selectIsLoading: createSelector(selectStatus, (status) => status === 'loading'),
    };
  },
});
