import { inject } from '@angular/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
  catchError,
  exhaustMap,
  filter,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { ApiError } from '../../../core/api/api-error';
import { WidgetEvents } from '../../../core/widgets/widget-events';
import { SOURCE_LABELS } from '../../../shared/pipes/source-label.pipe';
import type { FeedPageResult } from '../feed.models';
import { FeedApi } from '../feed-api';
import { filtersToParams, toggleTag } from '../feed-query-params';
import { FeedActions, FeedApiActions } from './feed.actions';
import { feedFeature } from './feed.reducer';

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.userMessage : 'Nie udało się pobrać wiadomości.';
}

const plural = new Intl.PluralRules('pl');
const NEWS: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: 'wiadomość',
  few: 'wiadomości',
  many: 'wiadomości',
};
const MORE_NEWS: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: 'kolejną wiadomość',
  few: 'kolejne wiadomości',
  many: 'kolejnych wiadomości',
};

function pageLoadedMessage({ items, sourceErrors }: FeedPageResult, append: boolean): string {
  const count = items.length;
  const words = (append ? MORE_NEWS : NEWS)[plural.select(count)];
  let message =
    count === 0 && !append ? 'Brak wiadomości do wyświetlenia.' : `Załadowano ${count} ${words}.`;
  if (sourceErrors.length > 0) {
    const sources = sourceErrors.map((error) => SOURCE_LABELS[error.source]).join(', ');
    message += ` Nie udało się pobrać wiadomości z: ${sources}.`;
  }
  return message;
}

export const loadFirstPage = createEffect(
  (actions$ = inject(Actions), store = inject(Store), api = inject(FeedApi)) =>
    actions$.pipe(
      ofType(FeedActions.opened, FeedActions.retried, FeedActions.filtersChanged),
      withLatestFrom(store.select(feedFeature.selectFilters)),
      // switchMap cancels previous search request (mergeMap caused stale results)
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
          takeUntil(
            actions$.pipe(
              ofType(FeedActions.opened, FeedActions.retried, FeedActions.filtersChanged),
            ),
          ),
        ),
      ),
    ),
  { functional: true },
);

// feed effects are created once, so replayed widget events can't toggle a tag twice
export const tagToggledInWidget = createEffect(
  (widgetEvents = inject(WidgetEvents)) =>
    widgetEvents.events$.pipe(
      filter((event) => event.type === 'insights-tag-toggle'),
      map(({ tag }) => FeedActions.tagToggled({ tag })),
    ),
  { functional: true },
);

export const applyToggledTag = createEffect(
  (actions$ = inject(Actions), store = inject(Store), router = inject(Router)) =>
    actions$.pipe(
      ofType(FeedActions.tagToggled),
      withLatestFrom(store.select(feedFeature.selectFilters)),
      tap(([{ tag }, filters]) => {
        void router.navigate(['/feed'], {
          queryParams: filtersToParams(toggleTag(filters, tag)),
          replaceUrl: true,
        });
      }),
    ),
  { functional: true, dispatch: false },
);

export const announcePageLoaded = createEffect(
  (actions$ = inject(Actions), announcer = inject(LiveAnnouncer)) =>
    actions$.pipe(
      ofType(FeedApiActions.pageLoaded),
      tap(({ page, append }) => void announcer.announce(pageLoadedMessage(page, append))),
    ),
  { functional: true, dispatch: false },
);
