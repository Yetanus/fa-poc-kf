import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ApiError } from '../api/api-error';
import { NotificationsStore } from '../notifications/notifications.store';

@Injectable()
export class AppErrorHandler implements ErrorHandler {
  private readonly notifications = inject(NotificationsStore);

  handleError(error: unknown): void {
    console.error(error);

    if (error instanceof ApiError) {
      if (!error.isGlobal) {
        this.notifications.show(error.userMessage, 'error');
      }
      return;
    }

    this.notifications.show('Wystąpił nieoczekiwany błąd. Odśwież stronę.', 'error');
  }
}
