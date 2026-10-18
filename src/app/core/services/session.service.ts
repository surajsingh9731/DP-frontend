import { Injectable, signal } from '@angular/core';
import type { SessionView } from '../api/contracts';

const STORAGE_KEY = 'sahmati.session';

/**
 * Holds the signed-in staff member's display session (org name, role,
 * name) as a signal. The real authentication lives in an httpOnly
 * session cookie the backend sets — this service never holds a token,
 * only the display data returned at verify time, mirrored to
 * sessionStorage purely so a page refresh doesn't blank the UI before
 * the auth guard's `/auth/me` check resolves.
 */
@Injectable({ providedIn: 'root' })
export class SessionService {
  readonly session = signal<SessionView | null>(this.readStored());
  readonly isAuthenticated = () => this.session() !== null;

  setSession(session: SessionView): void {
    this.session.set(session);
    this.writeStored(session);
  }

  clear(): void {
    this.session.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage unavailable — in-memory clear still took effect.
    }
  }

  private readStored(): SessionView | null {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SessionView) : null;
    } catch {
      return null;
    }
  }

  private writeStored(session: SessionView): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Private browsing / storage blocked — the signal still works for this tab.
    }
  }
}
