import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { FeedFilters, FeedItem, FeedPageResult } from '../feed.models';

export const FeedActions = createActionGroup({
  source: 'Feed',
  events: {
    Opened: props<{ filters: FeedFilters }>(),
    Retried: emptyProps(),
    'Filters Changed': props<{ filters: FeedFilters }>(),
    'Next Page Requested': emptyProps(),
    'New Items Shown': emptyProps(),
  },
});

export const FeedApiActions = createActionGroup({
  source: 'Feed API',
  events: {
    'Page Loaded': props<{ page: FeedPageResult; append: boolean }>(),
    'Page Failed': props<{ error: string }>(),
    'Poll Succeeded': props<{ items: FeedItem[] }>(),
  },
});
