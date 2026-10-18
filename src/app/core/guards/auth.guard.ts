import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthApiService } from '../api/auth-api.service';
import { SessionService } from '../services/session.service';

/**
 * Guards every authenticated route. A display session in memory/sessionStorage
 * is a UI convenience only — the real check is `/auth/me`, which fails on an
 * expired or missing cookie even if stale display data survived a refresh.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthApiService);
  const session = inject(SessionService);
  const router = inject(Router);

  return auth.me().pipe(
    map(() => true),
    catchError(() => {
      session.clear();
      return of(router.createUrlTree(['/sign-in']));
    }),
  );
};
