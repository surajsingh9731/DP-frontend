import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  ParticipantRightsView,
  ParticipantRightsRequest,
  SubmitRightsInput,
  RightsSummary,
  RightsDetail,
  RightsRequest,
  RightsActionInput,
} from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';
@Injectable({ providedIn: 'root' })
export class RightsApi {
  private readonly http = inject(HttpClient);
  private tenant(id: string) {
    return `${API_BASE}/tenants/${encodeURIComponent(id)}`;
  }
  private participant(tenant: string, session: string) {
    return `${this.tenant(tenant)}/consent-sandbox/sessions/${encodeURIComponent(session)}/requests`;
  }
  own(tenant: string, session: string) {
    return this.http.get<ParticipantRightsView>(this.participant(tenant, session));
  }
  submit(tenant: string, session: string, payload: SubmitRightsInput) {
    return this.http.post<ParticipantRightsRequest>(this.participant(tenant, session), payload);
  }
  list(tenant: string) {
    return this.http.get<RightsSummary[]>(`${this.tenant(tenant)}/rights`);
  }
  get(tenant: string, id: string) {
    return this.http.get<RightsDetail>(`${this.tenant(tenant)}/rights/${encodeURIComponent(id)}`);
  }
  action(tenant: string, id: string, payload: RightsActionInput) {
    return this.http.post<RightsRequest>(
      `${this.tenant(tenant)}/rights/${encodeURIComponent(id)}/actions`,
      payload,
    );
  }
}
