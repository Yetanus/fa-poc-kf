import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
} from '@angular/core';
import type { InsightsTagToggleDetail } from '@fa/contracts';
import { Store } from '@ngrx/store';
import { ThemeService } from '../../../core/theme/theme.service';
import { WidgetEvents } from '../../../core/widgets/widget-events';
import { feedFeature } from '../store/feed.reducer';

@Component({
  selector: 'app-insights-host',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    @switch (status()) {
      @case ('loading') {
        <p class="fa-text-muted">Ładowanie statystyk…</p>
      }
      @case ('failed') {
        <p role="alert">Nie udało się wczytać statystyk.</p>
      }
    }
    <fa-news-insights [items]="items()" [activeTags]="activeTags()" [attr.theme]="theme()" />
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class InsightsHost {
  private readonly store = inject(Store);

  protected readonly items = this.store.selectSignal(feedFeature.selectVisibleItems);
  protected readonly activeTags = this.store.selectSignal(feedFeature.selectActiveTags);
  protected readonly theme = inject(ThemeService).theme;
  protected readonly status = signal<'loading' | 'ready' | 'failed'>('loading');

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const widgetEvents = inject(WidgetEvents);
    const onTagToggle = (event: CustomEvent<InsightsTagToggleDetail>): void => {
      widgetEvents.emit({ type: 'insights-tag-toggle', tag: event.detail.tag });
    };

    host.addEventListener('fa-insights-tag-toggle', onTagToggle);
    inject(DestroyRef).onDestroy(() =>
      host.removeEventListener('fa-insights-tag-toggle', onTagToggle),
    );

    import('@fa/react-widget').then(
      () => this.status.set('ready'),
      () => this.status.set('failed'),
    );
  }
}
