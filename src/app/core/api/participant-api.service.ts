import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { ParticipantSessionService } from '../services/participant-session.service';
import type {
  AuthChannel,
  ConsentOfferItem,
  ConsentReceiptView,
  ConsentStatusItem,
  ParticipantChallengeView,
  ParticipantSessionView,
  PublicNoticeView,
  RightsRequestKind,
  RightsRequestView,
} from './contracts';

/**
 * Everything a data principal (parent, patient, employee, customer) can do
 * without ever creating an account — the public Privacy Center surface.
 * Every call is scoped to one organisation by its slug; calls past the
 * verify step carry the participant's bearer token from
 * `ParticipantSessionService`, never a cookie (there is no cookie for a
 * visitor who isn't logged into anything).
 */
@Injectable({ providedIn: 'root' })
export class ParticipantApiService {
  private readonly api = inject(ApiClientService);
  private readonly session = inject(ParticipantSessionService);

  notice(orgSlug: string): Observable<PublicNoticeView> {
    return this.api.get<PublicNoticeView>(`/public/${encodeURIComponent(orgSlug)}/notice`);
  }

  startVerification(
    orgSlug: string,
    identifier: string,
    language: 'en' | 'hi',
  ): Observable<ParticipantChallengeView> {
    return this.api.post<ParticipantChallengeView>(
      `/public/${encodeURIComponent(orgSlug)}/verify/start`,
      { identifier, language },
    );
  }

  confirmVerification(
    orgSlug: string,
    verificationId: string,
    code: string,
  ): Observable<ParticipantSessionView> {
    return this.api.post<ParticipantSessionView>(
      `/public/${encodeURIComponent(orgSlug)}/verify/${encodeURIComponent(verificationId)}/confirm`,
      { code },
    );
  }

  /** Stores a confirmed session's token, scoped to this organisation. */
  storeSession(orgSlug: string, session: ParticipantSessionView): void {
    this.session.set(orgSlug, session);
  }

  offer(orgSlug: string): Observable<{ available: boolean; purposes: ConsentOfferItem[] }> {
    return this.api.get(`/public/${encodeURIComponent(orgSlug)}/consent/offer`);
  }

  status(orgSlug: string): Observable<{ available: boolean; items: ConsentStatusItem[] }> {
    return this.api.get(
      `/public/${encodeURIComponent(orgSlug)}/consent/status`,
      this.session.authHeader(orgSlug),
    );
  }

  recordChoices(
    orgSlug: string,
    choices: { registerEntryId: string; decision: 'accept' | 'decline' }[],
    idempotencyKey: string,
  ): Observable<ConsentReceiptView> {
    return this.api.post(
      `/public/${encodeURIComponent(orgSlug)}/consent/choices`,
      { choices, idempotencyKey },
      this.session.authHeader(orgSlug),
    );
  }

  withdraw(
    orgSlug: string,
    registerEntryIds: string[],
    idempotencyKey: string,
  ): Observable<ConsentReceiptView> {
    return this.api.post(
      `/public/${encodeURIComponent(orgSlug)}/consent/withdraw`,
      { registerEntryIds, idempotencyKey },
      this.session.authHeader(orgSlug),
    );
  }

  submitRequest(
    orgSlug: string,
    kind: RightsRequestKind,
    details: string,
    idempotencyKey: string,
  ): Observable<RightsRequestView> {
    return this.api.post(
      `/public/${encodeURIComponent(orgSlug)}/rights/requests`,
      { kind, details, idempotencyKey },
      this.session.authHeader(orgSlug),
    );
  }

  myRequests(orgSlug: string): Observable<RightsRequestView[]> {
    return this.api.get(
      `/public/${encodeURIComponent(orgSlug)}/rights/requests`,
      this.session.authHeader(orgSlug),
    );
  }

  hasSession(orgSlug: string): boolean {
    return this.session.get(orgSlug) !== null;
  }

  channelLabel(channel: AuthChannel, language: 'en' | 'hi'): string {
    if (channel === 'email') return language === 'hi' ? 'ईमेल' : 'email';
    return language === 'hi' ? 'WhatsApp' : 'WhatsApp';
  }
}
