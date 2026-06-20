import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { environment } from '../../../environments/environment';

/// Attaches the Supabase access token as a Bearer header on every request to the
/// API gateway. The gateway validates the JWT and stamps `X-Requester-Id` from
/// its `sub` claim, so the frontend never sends that header itself.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const token = inject(SupabaseService).session()?.access_token;
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
