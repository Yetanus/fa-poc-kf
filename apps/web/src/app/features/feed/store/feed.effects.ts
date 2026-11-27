import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, exhaustMap, filter, map, of, switchMap, withLatestFrom } from 'rxjs';
import { ApiError } from '../../../core/api/api-error';
import { FeedApi } from '../feed-api';
import { FeedActions, FeedApiActions } from './feed.actions';
import { feedFeature } from './feed.reducer';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.userMessage : 'Nie udało się pobrać wiadomości.';
}

export const loadFirstPage = createEffect(
  (actions$ = inject(Actions), store = inject(Store), api = inject(FeedApi)) =>
    actions$.pipe(
      ofType(FeedActions.opened, FeedActions.retried),
      withLatestFrom(store.select(feedFeature.selectFilters)),
      switchMap(([, filters]) =>
        api.loadPage(filters, null).pipe(
          map((page) => FeedApiActions.pageLoaded({ page, append: false })),
          catchError((error: unknown) =>
            of(FeedApiActions.pageFailed({ error: errorMessage(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);

export const loadNextPage = createEffect(
  (actions$ = inject(Actions), store = inject(Store), api = inject(FeedApi)) =>
    actions$.pipe(
      ofType(FeedActions.nextPageRequested),
      withLatestFrom(
        store.select(feedFeature.selectFilters),
        store.select(feedFeature.selectEndCursor),
      ),
      filter(([, , cursor]) => cursor !== null),
      exhaustMap(([, filters, cursor]) =>
        api.loadPage(filters, cursor).pipe(
          map((page) => FeedApiActions.pageLoaded({ page, append: true })),
          catchError((error: unknown) =>
            of(FeedApiActions.pageFailed({ error: errorMessage(error) })),
          ),
        ),
      ),
    ),
  { functional: true },
);
