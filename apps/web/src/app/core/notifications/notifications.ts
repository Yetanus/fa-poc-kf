import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NotificationsStore } from './notifications.store';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  protected readonly store = inject(NotificationsStore);
  protected readonly notifications = toSignal(this.store.notifications$, { requireSync: true });
}
