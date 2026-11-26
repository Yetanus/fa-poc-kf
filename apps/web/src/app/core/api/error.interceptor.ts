import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationsStore } from '../notifications/notifications.store';
import { ApiError } from './api-error';

function toApiError(error: HttpErrorResponse): ApiError {
  if (error.status === 0) {
    const timedOut = error.error instanceof DOMException && error.error.name === 'TimeoutError';
    return new ApiError(timedOut ? 'timeout' : 'network', error.message, 0);
  }
  if (error.status >= 500) {
    return new ApiError('server', error.message, error.status);
  }
  return new ApiError('client', error.message, error.status);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationsStore);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const apiError = toApiError(error);
      if (apiError.isGlobal) {
        notifications.show(apiError.userMessage, 'error');
      }
      return throwError(() => apiError);
    }),
  );
};
