import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Api } from './api.service';

export const authGuard: CanActivateFn = () => {
  const api = inject(Api);
  return api.connecte ? true : inject(Router).createUrlTree(['/login']);
};
