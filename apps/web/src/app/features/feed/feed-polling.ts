import { DOCUMENT, DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import {
  EMPTY,
  Observable,
  catchError,
  combineLatest,
  distinctUntilChanged,
  fromEvent,
  map,
  retry,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { FeedApi } from './feed-api';
import type { FeedFilters, FeedItem } from './feed.models';
import { FeedApiActions } from './store/feed.actions';
import { feedFeature } from './store/feed.reducer';

export const POLL_INTERVAL_MS = 60_000;

@Injectable()
export class FeedPolling {
  private readonly store = inject(Store);
  private readonly api = inject(FeedApi);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  start(): void {
    const visible$ = fromEvent(this.document, 'visibilitychange').pipe(
      startWith(null),
      map(() => this.document.visibilityState === 'visible'),
      distinctUntilChanged(),
    );

    combineLatest([visible$, this.store.select(feedFeature.selectFilters)])
      .pipe(
        switchMap(([visible, filters]) =>
          visible
            ? timer(POLL_INTERVAL_MS, POLL_INTERVAL_MS).pipe(switchMap(() => this.check(filters)))
            : EMPTY,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((items) => this.store.dispatch(FeedApiActions.pollSucceeded({ items })));
  }

  private check(filters: FeedFilters): Observable<FeedItem[]> {
    return this.api.loadPage(filters, null, { silent: true }).pipe(
      map((page) => page.items),
      retry({ count: 3, delay: (_error, retryCount) => timer(1000 * 2 ** retryCount) }),
      catchError(() => EMPTY),
    );
  }
}
