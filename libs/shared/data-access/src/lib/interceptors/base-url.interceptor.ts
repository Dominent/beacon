import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { API_BASE_URL } from '../api-config';

/**
 * Functional interceptor: rewrites root-relative `/api/...` requests to absolute
 * URLs against {@link API_BASE_URL}. Keeps feature code free of the origin and
 * makes SSR work without each call knowing the server address.
 */
export const baseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/')) {
    const base = inject(API_BASE_URL);
    return next(req.clone({ url: `${base}${req.url}` }));
  }
  return next(req);
};
