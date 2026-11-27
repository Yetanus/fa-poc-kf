import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import * as feedEffects from './store/feed.effects';
import { feedFeature } from './store/feed.reducer';

export default [
  {
    path: '',
    providers: [provideState(feedFeature), provideEffects(feedEffects)],
    loadComponent: () => import('./feed-page').then((m) => m.FeedPage),
  },
] satisfies Routes;
