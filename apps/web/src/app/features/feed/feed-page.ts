import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { NewsCard } from '../../shared/ui/news-card/news-card';
import { SourceErrorsBanner } from './source-errors-banner/source-errors-banner';
import { FeedActions } from './store/feed.actions';
import { feedFeature } from './store/feed.reducer';

@Component({
  selector: 'app-feed-page',
  imports: [NewsCard, SourceErrorsBanner],
  templateUrl: './feed-page.html',
  styleUrl: './feed-page.scss',
})
export class FeedPage {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(feedFeature.selectVisibleItems);
  protected readonly status = this.store.selectSignal(feedFeature.selectStatus);
  protected readonly isLoading = this.store.selectSignal(feedFeature.selectIsLoading);
  protected readonly error = this.store.selectSignal(feedFeature.selectError);
  protected readonly sourceErrors = this.store.selectSignal(feedFeature.selectSourceErrors);

  protected readonly showSkeletons = computed(
    () => this.items().length === 0 && (this.isLoading() || this.status() === 'idle'),
  );
  protected readonly priorityId = computed(() => this.items().find((item) => item.imageUrl)?.id);
  protected readonly skeletons = [1, 2, 3, 4, 5, 6];

  constructor() {
    this.store.dispatch(FeedActions.opened());
  }

  protected retry(): void {
    this.store.dispatch(FeedActions.retried());
  }
}
