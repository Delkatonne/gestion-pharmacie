import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Api } from './api.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const api = inject(Api);
  const t = api.token;
  const r = t ? req.clone({ setHeaders: { Authorization: `Bearer ${t}` } }) : req;
  return next(r).pipe(catchError(e => {
    if (e.status === 401 && !req.url.includes('/auth/login')) api.logout();
    return throwError(() => e);
  }));
};
