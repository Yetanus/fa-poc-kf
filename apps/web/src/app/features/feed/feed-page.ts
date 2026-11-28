import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, map } from 'rxjs';
import { InViewportDirective } from '../../shared/directives/in-viewport.directive';
import { NewsCard } from '../../shared/ui/news-card/news-card';
import { FeedFiltersForm } from './feed-filters-form/feed-filters-form';
import type { FeedFilters, FeedItem } from './feed.models';
import { filtersFromParams, filtersToParams, sameFilters } from './feed-query-params';
import { NewsPreviewDialog } from './news-preview-dialog/news-preview-dialog';
import { SourceErrorsBanner } from './source-errors-banner/source-errors-banner';
import { FeedActions } from './store/feed.actions';
import { feedFeature } from './store/feed.reducer';

@Component({
  selector: 'app-feed-page',
  imports: [FeedFiltersForm, InViewportDirective, NewsCard, NewsPreviewDialog, SourceErrorsBanner],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.scss',
})
export class FeedPage {
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly filters = this.store.selectSignal(feedFeature.selectFilters);
  protected readonly items = this.store.selectSignal(feedFeature.selectVisibleItems);
  protected readonly status = this.store.selectSignal(feedFeature.selectStatus);
  protected readonly isLoading = this.store.selectSignal(feedFeature.selectIsLoading);
  protected readonly error = this.store.selectSignal(feedFeature.selectError);
  protected readonly sourceErrors = this.store.selectSignal(feedFeature.selectSourceErrors);
  protected readonly hasNextPage = this.store.selectSignal(feedFeature.selectHasNextPage);
  protected readonly nextPageFailed = this.store.selectSignal(feedFeature.selectNextPageFailed);

  protected readonly showSkeletons = computed(
    () => this.items().length === 0 && (this.isLoading() || this.status() === 'idle'),
  );
  protected readonly priorityId = computed(() => this.items().find((item) => item.imageUrl)?.id);
  protected readonly skeletons = [1, 2, 3, 4, 5, 6];
  protected readonly previewItem = signal<FeedItem | null>(null);

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
  }

  protected changeFilters(filters: FeedFilters): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: filtersToParams(filters),
      replaceUrl: true,
    });
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
