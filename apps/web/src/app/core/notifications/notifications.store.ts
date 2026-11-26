import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationKind = 'info' | 'error';

export interface AppNotification {
  readonly id: number;
  readonly kind: NotificationKind;
  readonly message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  private readonly state = new BehaviorSubject<readonly AppNotification[]>([]);
  private nextId = 1;

  readonly notifications$ = this.state.asObservable();

  show(message: string, kind: NotificationKind = 'info'): void {
    const current = this.state.value;
    if (current.some((notification) => notification.message === message)) {
      return;
    }
    this.state.next([...current, { id: this.nextId++, kind, message }]);
  }

  dismiss(id: number): void {
    this.state.next(this.state.value.filter((notification) => notification.id !== id));
  }
}
