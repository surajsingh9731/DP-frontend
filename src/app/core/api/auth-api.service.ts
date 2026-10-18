import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { SessionService } from '../services/session.service';
import type { ChallengeView, MembershipRole, SessionView } from './contracts';

/** Mirrors dp-backend's AuthenticatedSession (common/guards/session.guard.ts) — what GET /auth/me returns, distinct from the richer SessionView issued at verify time. */
export interface AuthenticatedSession {
  sessionId: string;
  tenantId: string;
  userId: string;
  membershipId: string;
  role: MembershipRole;
}

export interface SignupPayload {
  organisationName: string;
  sectorPackCode: string;
  ownerDisplayName: string;
  ownerIdentifier: string;
  language: 'en' | 'hi';
}

export interface LoginPayload {
  identifier: string;
  language: 'en' | 'hi';
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly api = inject(ApiClientService);
  private readonly session = inject(SessionService);

  signup(payload: SignupPayload): Observable<ChallengeView> {
    return this.api.post<ChallengeView>('/auth/signup', payload);
  }

  login(payload: LoginPayload): Observable<ChallengeView> {
    return this.api.post<ChallengeView>('/auth/login', payload);
  }

  verify(challengeId: string, code: string): Observable<{ session: SessionView }> {
    return this.api
      .post<{ session: SessionView }>(`/auth/challenges/${challengeId}/verify`, { code })
      .pipe(tap((result) => this.session.setSession(result.session)));
  }

  /** Confirms the session cookie is still valid (used by the auth guard on refresh); does not repopulate the richer SessionView, so it never overwrites display info already held from verify(). */
  me(): Observable<AuthenticatedSession> {
    return this.api.get<AuthenticatedSession>('/auth/me');
  }

  logout(): Observable<void> {
    return this.api.post<void>('/auth/logout').pipe(tap(() => this.session.clear()));
  }
}
