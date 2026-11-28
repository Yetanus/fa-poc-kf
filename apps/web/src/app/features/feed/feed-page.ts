import {
  Component,
  DestroyRef,
  afterNextRender,
  Injector,
  computed,
  inject,
  signal,
  viewChildren,
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { I18nPluralPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map } from 'rxjs';
import { InViewportDirective } from '../../shared/directives/in-viewport.directive';
import { NEW_ITEMS_PLURAL } from '../../shared/pipes/plurals';
import { NewsCard } from '../../shared/ui/news-card/news-card';
import { FeedFiltersForm } from './feed-filters-form/feed-filters-form';
import type { FeedFilters, FeedItem } from './feed.models';
import { FeedPolling } from './feed-polling';
import { filtersFromParams, filtersToParams, sameFilters } from './feed-query-params';
import { NewsPreviewDialog } from './news-preview-dialog/news-preview-dialog';
import { SourceErrorsBanner } from './source-errors-banner/source-errors-banner';
import { FeedActions } from './store/feed.actions';
import { feedFeature } from './store/feed.reducer';

@Component({
  selector: 'app-feed-page',
  imports: [
    FeedFiltersForm,
    I18nPluralPipe,
    InViewportDirective,
    NewsCard,
    NewsPreviewDialog,
    SourceErrorsBanner,
  ],
  providers: [FeedPolling],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.scss',
})
export class FeedPage {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);

  protected readonly filters = this.store.selectSignal(feedFeature.selectFilters);
  protected readonly items = this.store.selectSignal(feedFeature.selectVisibleItems);
  protected readonly status = this.store.selectSignal(feedFeature.selectStatus);
  protected readonly isLoading = this.store.selectSignal(feedFeature.selectIsLoading);
  protected readonly error = this.store.selectSignal(feedFeature.selectError);
  protected readonly sourceErrors = this.store.selectSignal(feedFeature.selectSourceErrors);
  protected readonly hasNextPage = this.store.selectSignal(feedFeature.selectHasNextPage);
  protected readonly nextPageFailed = this.store.selectSignal(feedFeature.selectNextPageFailed);
  protected readonly pendingCount = this.store.selectSignal(feedFeature.selectPendingCount);
  protected readonly newItemsPlural = NEW_ITEMS_PLURAL;

  protected readonly showSkeletons = computed(
    () => this.items().length === 0 && (this.isLoading() || this.status() === 'idle'),
  );
  protected readonly priorityId = computed(() => this.items().find((item) => item.imageUrl)?.id);
  protected readonly skeletons = [1, 2, 3, 4, 5, 6];
  protected readonly previewItem = signal<FeedItem | null>(null);

  private readonly cards = viewChildren(NewsCard);
  private readonly keyManager = new FocusKeyManager(this.cards, this.injector)
    .withHorizontalOrientation('ltr')
    .withHomeAndEnd();
  private readonly activeIndex = signal(0);
  protected readonly tabbableIndex = computed(() =>
    Math.min(this.activeIndex(), this.items().length - 1),
  );

  constructor() {
    this.route.queryParamMap
      .pipe(
        map(filtersFromParams),
        distinctUntilChanged(sameFilters),
        map((filters, index) =>
          index === 0 ? FeedActions.opened({ filters }) : FeedActions.filtersChanged({ filters }),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((action) => this.store.dispatch(action));

    this.keyManager.change
      .pipe(takeUntilDestroyed())
      .subscribe((index) => this.activeIndex.set(index));
    inject(DestroyRef).onDestroy(() => this.keyManager.destroy());

    inject(FeedPolling).start();
  }

  protected changeFilters(filters: FeedFilters): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtersToParams(filters),
      replaceUrl: true,
    });
  }

  protected onFeedKeydown(event: KeyboardEvent): void {
    this.keyManager.onKeydown(event);
  }

  protected onCardFocus(index: number): void {
    this.keyManager.updateActiveItem(index);
    this.activeIndex.set(index);
  }

  protected showNewItems(): void {
    this.store.dispatch(FeedActions.newItemsShown());
    afterNextRender(() => this.keyManager.setFirstItemActive(), { injector: this.injector });
  }

  protected loadMore(): void {
    this.store.dispatch(FeedActions.nextPageRequested());
  }

  protected openPreview(item: FeedItem): void {
    this.previewItem.set(item);
  }

  protected closePreview(): void {
    this.previewItem.set(null);
  }

  protected retry(): void {
    this.store.dispatch(FeedActions.retried());
  }
}
