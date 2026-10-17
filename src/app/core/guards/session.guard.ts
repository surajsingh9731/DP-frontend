import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Api } from '../api.service';

export const sessionGuard: CanActivateFn = () => {
  const api = inject(Api);
  const router = inject(Router);
  return api.me().pipe(
    map(() => true),
    catchError(() => {
      api.session.set(null);
      return of(router.createUrlTree(['/login']));
    }),
  );
};
