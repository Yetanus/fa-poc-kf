import type { TickerItem } from '@fa/contracts';
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
  nextPageFailed: boolean;
  pendingItems: FeedItem[];
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
  nextPageFailed: false,
  pendingItems: [],
  sourceErrors: [],
});

function matchesFilters(item: FeedItem, filters: FeedFilters): boolean {
  if (!filters.sources.includes(item.source)) {
    return false;
  }
  return filters.tags.length === 0 || filters.tags.some((tag) => item.tags.includes(tag));
}

function loadingFirstPage(state: FeedState): FeedState {
  return {
    ...state,
    status: 'loading',
    error: null,
    endCursor: null,
    hasNextPage: false,
    nextPageFailed: false,
    pendingItems: [],
  };
}

export const feedFeature = createFeature({
  name: 'feed',
  reducer: createReducer(
    initialFeedState,
    on(FeedActions.opened, FeedActions.filtersChanged, (state, { filters }) =>
      loadingFirstPage({ ...state, filters }),
    ),
    on(FeedActions.retried, loadingFirstPage),
    on(FeedActions.nextPageRequested, (state): FeedState =>
      state.hasNextPage && state.status === 'loaded'
        ? { ...state, status: 'loadingMore', nextPageFailed: false }
        : state,
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
    on(FeedApiActions.pageFailed, (state, { error }): FeedState =>
      state.status === 'loadingMore'
        ? { ...state, status: 'loaded', nextPageFailed: true }
        : { ...state, status: 'error', error },
    ),
    on(FeedApiActions.pollSucceeded, (state, { items }): FeedState => {
      if (state.status !== 'loaded') {
        return state;
      }
      const fresh = items.filter(
        (item) => !state.entities[item.id] && !state.pendingItems.some((p) => p.id === item.id),
      );
      return fresh.length > 0
        ? { ...state, pendingItems: [...fresh, ...state.pendingItems] }
        : state;
    }),
    on(FeedActions.newItemsShown, (state) =>
      feedAdapter.upsertMany(state.pendingItems, { ...state, pendingItems: [] }),
    ),
  ),
  extraSelectors: ({ selectFeedState, selectFilters, selectStatus, selectPendingItems }) => {
    const { selectAll } = feedAdapter.getSelectors(selectFeedState);

    return {
      selectAllItems: selectAll,
      selectVisibleItems: createSelector(selectAll, selectFilters, (items, filters) =>
        items.filter((item) => matchesFilters(item, filters)),
      ),
      selectTickerItems: createSelector(selectAll, (items): TickerItem[] =>
        items
          .slice(0, 10)
          .map(({ id, source, title, publishedAt }) => ({ id, source, title, publishedAt })),
      ),
      selectIsLoading: createSelector(selectStatus, (status) => status === 'loading'),
      selectPendingCount: createSelector(selectPendingItems, (items) => items.length),
    };
  },
});
