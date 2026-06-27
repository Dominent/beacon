import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../notification.service';

/**
 * Centralised HTTP error handling: surface a single user-facing message and
 * rethrow so callers can still react. One place to evolve retry/auth logic.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const message =
        error.status === 0
          ? 'Cannot reach the Beacon API. Is it running on :3333?'
          : `Request failed (${error.status}) for ${req.method} ${req.url}`;
      notify.error(message);
      return throwError(() => error);
    })
  );
};
