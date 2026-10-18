import { Injectable } from '@angular/core';

interface StoredParticipantSession {
  token: string;
  expiresAt: string;
}

const PREFIX = 'sahmati.participant.';

/**
 * Holds a verified data principal's session token — scoped per organisation
 * slug, since the same browser may hold valid sessions for more than one
 * organisation (a parent with two children at two different schools).
 * Deliberately `sessionStorage`, not `localStorage`: these sessions are
 * short-lived (15 minutes, set by the backend) and should not outlive the
 * tab once closed.
 */
@Injectable({ providedIn: 'root' })
export class ParticipantSessionService {
  set(orgSlug: string, session: StoredParticipantSession): void {
    try {
      sessionStorage.setItem(PREFIX + orgSlug, JSON.stringify(session));
    } catch {
      // Storage unavailable — the session still works for the rest of this
      // page view via whatever component just received the token.
    }
  }

  get(orgSlug: string): StoredParticipantSession | null {
    try {
      const raw = sessionStorage.getItem(PREFIX + orgSlug);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as StoredParticipantSession;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        this.clear(orgSlug);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  clear(orgSlug: string): void {
    try {
      sessionStorage.removeItem(PREFIX + orgSlug);
    } catch {
      // Nothing to clean up if storage was never reachable.
    }
  }

  authHeader(orgSlug: string): Record<string, string> | undefined {
    const session = this.get(orgSlug);
    return session ? { Authorization: `Bearer ${session.token}` } : undefined;
  }
}
