import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  ConsentOffer,
  ConsentParticipant,
  ConsentReceipt,
  CreateConsentOffer,
  SubmitConsentChoices,
  WithdrawConsentChoices,
} from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';
@Injectable({ providedIn: 'root' })
export class ConsentApi {
  private readonly http = inject(HttpClient);
  private path(tenant: string) {
    return `${API_BASE}/tenants/${encodeURIComponent(tenant)}/consent-sandbox`;
  }
  offers(tenant: string) {
    return this.http.get<ConsentOffer[]>(`${this.path(tenant)}/offers`);
  }
  create(tenant: string, payload: CreateConsentOffer) {
    return this.http.post<ConsentOffer>(`${this.path(tenant)}/offers`, payload);
  }
  ledger(tenant: string) {
    return this.http.get<ConsentReceipt[]>(`${this.path(tenant)}/receipts`);
  }
  start(tenant: string, offerId: string) {
    return this.http.post<ConsentParticipant>(`${this.path(tenant)}/sessions`, {
      offerId,
      syntheticAdultAcknowledged: true,
    });
  }
  get(tenant: string, id: string) {
    return this.http.get<ConsentParticipant>(
      `${this.path(tenant)}/sessions/${encodeURIComponent(id)}`,
    );
  }
  end(tenant: string, id: string) {
    return this.http.post(`${this.path(tenant)}/sessions/${encodeURIComponent(id)}/end`, {});
  }
  record(tenant: string, id: string, payload: SubmitConsentChoices) {
    return this.http.post<ConsentReceipt>(
      `${this.path(tenant)}/sessions/${encodeURIComponent(id)}/choices`,
      payload,
    );
  }
  withdraw(tenant: string, id: string, payload: WithdrawConsentChoices) {
    return this.http.post<ConsentReceipt>(
      `${this.path(tenant)}/sessions/${encodeURIComponent(id)}/withdraw`,
      payload,
    );
  }
}
