import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';

/// Sends the active UI language as `Accept-Language` so Spring Boot
/// (`spring.mvc.locale-resolver=accept-header`) and the gateway's own error
/// messages come back localized. The gateway forwards this header verbatim.
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }

  const lang = inject(TranslocoService).getActiveLang();
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};
