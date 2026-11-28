import { AsyncPipe } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component, DestroyRef, ElementRef, inject } from '@angular/core';
import type { TickerItem, TickerSelectDetail } from '@fa/contracts';
import { Store } from '@ngrx/store';
import { distinctUntilChanged } from 'rxjs';
import { WidgetEvents } from '../../../core/widgets/widget-events';
import { feedFeature } from '../store/feed.reducer';

function sameHeadlines(a: TickerItem[], b: TickerItem[]): boolean {
  return a.length === b.length && a.every((item, index) => item.id === b[index]?.id);
}

@Component({
  selector: 'app-ticker-host',
  imports: [AsyncPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `<fa-news-ticker [items]="items$ | async" />`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class TickerHost {
  // new array restarts the ticker from the beginning, so skip it when headlines are the same
  protected readonly items$ = inject(Store)
    .select(feedFeature.selectTickerItems)
    .pipe(distinctUntilChanged(sameHeadlines));

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const widgetEvents = inject(WidgetEvents);
    const onSelect = (event: CustomEvent<TickerSelectDetail>): void => {
      widgetEvents.emit({ type: 'ticker-select', id: event.detail.id });
    };

    host.addEventListener('fa-ticker-select', onSelect);
    inject(DestroyRef).onDestroy(() => host.removeEventListener('fa-ticker-select', onSelect));

    void import('@fa/ts-widget');
  }
}
