import type { NewsSource } from '../../../graphql/generated/graphql';
import type { FeedItem, FeedPageResult } from '../feed.models';
import { FeedActions, FeedApiActions } from './feed.actions';
import { FeedState, feedFeature, initialFeedState } from './feed.reducer';

const { reducer } = feedFeature;

function item(id: string, source: NewsSource, publishedAt: string, tags: string[] = []): FeedItem {
  return {
    id,
    source,
    title: id,
    url: null,
    summary: null,
    imageUrl: null,
    publishedAt,
    score: null,
    commentsCount: null,
    readTimeMinutes: null,
    tags,
    author: null,
  };
}

function page(items: FeedItem[], endCursor: string | null = 'next'): FeedPageResult {
  return { items, endCursor, hasNextPage: endCursor !== null, sourceErrors: [] };
}

describe('feed reducer', () => {
  it('replaces items with the first page sorted by date', () => {
    const loading = reducer(initialFeedState, FeedActions.opened());
    expect(loading.status).toBe('loading');

    const state = reducer(
      loading,
      FeedApiActions.pageLoaded({
        page: page([
          item('HACKER_NEWS:1', 'HACKER_NEWS', '2026-11-20T10:00:00Z'),
          item('DEV_TO:2', 'DEV_TO', '2026-11-21T10:00:00Z'),
        ]),
        append: false,
      }),
    );

    expect(state.status).toBe('loaded');
    expect(state.endCursor).toBe('next');
    expect(feedFeature.selectAllItems.projector(state).map((i) => i.id)).toEqual([
      'DEV_TO:2',
      'HACKER_NEWS:1',
    ]);
  });

  it('appends next page without duplicates', () => {
    const first = reducer(
      initialFeedState,
      FeedApiActions.pageLoaded({
        page: page([item('DEV_TO:1', 'DEV_TO', '2026-11-21T10:00:00Z')]),
        append: false,
      }),
    );
    const loadingMore = reducer(first, FeedActions.nextPageRequested());
    expect(loadingMore.status).toBe('loadingMore');

    const state = reducer(
      loadingMore,
      FeedApiActions.pageLoaded({
        page: page(
          [
            item('DEV_TO:1', 'DEV_TO', '2026-11-21T10:00:00Z'),
            item('SPACEFLIGHT:5', 'SPACEFLIGHT', '2026-11-19T10:00:00Z'),
          ],
          null,
        ),
        append: true,
      }),
    );

    expect(state.ids).toEqual(['DEV_TO:1', 'SPACEFLIGHT:5']);
    expect(state.hasNextPage).toBe(false);
  });

  it('ignores next page request when there is no next page', () => {
    const state = reducer(initialFeedState, FeedActions.nextPageRequested());
    expect(state).toBe(initialFeedState);
  });

  it('keeps items and stores message when loading fails', () => {
    const loaded = reducer(
      initialFeedState,
      FeedApiActions.pageLoaded({
        page: page([item('DEV_TO:1', 'DEV_TO', '2026-11-21T10:00:00Z')]),
        append: false,
      }),
    );
    const state = reducer(loaded, FeedApiActions.pageFailed({ error: 'Serwer nie odpowiada.' }));

    expect(state.status).toBe('error');
    expect(state.error).toBe('Serwer nie odpowiada.');
    expect(state.ids).toEqual(['DEV_TO:1']);
  });
});

describe('feed selectors', () => {
  const items = [
    item('HACKER_NEWS:1', 'HACKER_NEWS', '2026-11-21T10:00:00Z', ['ai']),
    item('DEV_TO:2', 'DEV_TO', '2026-11-20T10:00:00Z', ['angular', 'rxjs']),
    item('SPACEFLIGHT:3', 'SPACEFLIGHT', '2026-11-19T10:00:00Z', ['nasa']),
  ];

  it('selectVisibleItems filters by sources and tags', () => {
    const visible = feedFeature.selectVisibleItems.projector(items, {
      search: '',
      sources: ['HACKER_NEWS', 'DEV_TO'],
      tags: ['rxjs', 'nasa'],
    });

    expect(visible.map((i) => i.id)).toEqual(['DEV_TO:2']);
  });

  it('selectSourceErrors returns errors from the last page', () => {
    const state: FeedState = reducer(
      initialFeedState,
      FeedApiActions.pageLoaded({
        page: {
          ...page([]),
          sourceErrors: [{ source: 'DEV_TO', message: 'DEV_TO is unavailable' }],
        },
        append: false,
      }),
    );

    expect(feedFeature.selectSourceErrors({ feed: state })).toEqual([
      { source: 'DEV_TO', message: 'DEV_TO is unavailable' },
    ]);
  });
});
