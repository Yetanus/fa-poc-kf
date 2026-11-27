import { createActionGroup, emptyProps, props } from '@ngrx/store';
import type { FeedPageResult } from '../feed.models';

export const FeedActions = createActionGroup({
  source: 'Feed',
  events: {
    Opened: emptyProps(),
    Retried: emptyProps(),
    'Next Page Requested': emptyProps(),
  },
});

export const FeedApiActions = createActionGroup({
  source: 'Feed API',
  events: {
    'Page Loaded': props<{ page: FeedPageResult; append: boolean }>(),
    'Page Failed': props<{ error: string }>(),
  },
});
