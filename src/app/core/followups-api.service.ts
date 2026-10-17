import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  FollowupTask,
  FollowupDetail,
  FollowupAssignee,
  FollowupActionInput,
} from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';
@Injectable({ providedIn: 'root' })
export class FollowupsApi {
  private readonly http = inject(HttpClient);
  private path(tenant: string) {
    return `${API_BASE}/tenants/${encodeURIComponent(tenant)}/followups`;
  }
  list(tenant: string) {
    return this.http.get<FollowupTask[]>(this.path(tenant));
  }
  get(tenant: string, id: string) {
    return this.http.get<FollowupDetail>(`${this.path(tenant)}/${encodeURIComponent(id)}`);
  }
  assignees(tenant: string) {
    return this.http.get<FollowupAssignee[]>(`${this.path(tenant)}/assignees`);
  }
  create(tenant: string, receiptId: string, idempotencyKey: string) {
    return this.http.post<FollowupTask[]>(`${this.path(tenant)}/from-receipt`, {
      receiptId,
      idempotencyKey,
      syntheticOnlyAcknowledged: true,
    });
  }
  action(tenant: string, id: string, payload: FollowupActionInput) {
    return this.http.post<FollowupTask>(
      `${this.path(tenant)}/${encodeURIComponent(id)}/actions`,
      payload,
    );
  }
}
