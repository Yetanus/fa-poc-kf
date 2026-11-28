import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

export type WidgetEvent =
  | { readonly type: 'ticker-select'; readonly id: string }
  | { readonly type: 'insights-tag-toggle'; readonly tag: string };

@Injectable({ providedIn: 'root' })
export class WidgetEvents {
  private readonly events = new ReplaySubject<WidgetEvent>(5);
  readonly events$ = this.events.asObservable();

  emit(event: WidgetEvent): void {
    this.events.next(event);
  }
}
