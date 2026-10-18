import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { ParticipantSessionService } from '../services/participant-session.service';

/**
 * Guards the participant's own "my consent" / "my requests" pages — a
 * lightweight, client-side check only (unlike `authGuard`'s server round
 * trip), because the backend's own `ParticipantSessionGuard` is the real
 * authority on every request anyway. This just sends a visitor without a
 * live token straight to the verify step for the same organisation,
 * instead of letting the page itself fail with a confusing error.
 */
export const participantGuard: CanActivateFn = (route) => {
  const sessions = inject(ParticipantSessionService);
  const router = inject(Router);

  const orgSlug = route.paramMap.get('orgSlug');
  if (!orgSlug) return router.createUrlTree(['/']);

  if (sessions.get(orgSlug)) return true;

  return router.createUrlTree(['/', orgSlug, 'verify'], {
    queryParams: { next: route.url.map((segment) => segment.path).join('/') || undefined },
  });
};
