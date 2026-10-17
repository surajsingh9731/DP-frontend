import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  RetentionPolicy,
  RetentionHold,
  RetentionRecordDetail,
  RetentionPage,
  RetentionContextView,
  RetentionPreviewPage,
  CreateRetentionPolicy,
  EditRetentionPolicy,
  RetentionPolicyAction,
  CreateRetentionHold,
  ReleaseRetentionHold,
  CreateRetentionPreview,
} from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';
export interface RetentionSavedPreview {
  id: string;
  entryId: string;
  asOf: string;
  createdAt: string;
  contentHash: string;
}
@Injectable({ providedIn: 'root' })
export class RetentionApi {
  private readonly http = inject(HttpClient);
  private base(tenant: string) {
    return `${API_BASE}/tenants/${encodeURIComponent(tenant)}/retention`;
  }
  private params(entryId: string, after?: string) {
    return { entryId, limit: 20, ...(after ? { after } : {}) };
  }
  policies(tenant: string, entryId: string, after?: string) {
    return this.http.get<RetentionPage<RetentionPolicy>>(`${this.base(tenant)}/policies`, {
      params: this.params(entryId, after),
    });
  }
  holds(tenant: string, entryId: string, after?: string) {
    return this.http.get<RetentionPage<RetentionHold>>(`${this.base(tenant)}/holds`, {
      params: this.params(entryId, after),
    });
  }
  snapshots(tenant: string, entryId: string, after?: string) {
    return this.http.get<RetentionPage<RetentionSavedPreview>>(`${this.base(tenant)}/previews`, {
      params: this.params(entryId, after),
    });
  }
  policy(tenant: string, id: string) {
    return this.http.get<RetentionRecordDetail<RetentionPolicy>>(
      `${this.base(tenant)}/policies/${encodeURIComponent(id)}`,
    );
  }
  hold(tenant: string, id: string) {
    return this.http.get<RetentionRecordDetail<RetentionHold>>(
      `${this.base(tenant)}/holds/${encodeURIComponent(id)}`,
    );
  }
  createPolicy(tenant: string, body: CreateRetentionPolicy) {
    return this.http.post<RetentionPolicy>(`${this.base(tenant)}/policies`, body);
  }
  editPolicy(tenant: string, id: string, body: EditRetentionPolicy) {
    return this.http.put<RetentionPolicy>(
      `${this.base(tenant)}/policies/${encodeURIComponent(id)}`,
      body,
    );
  }
  policyAction(tenant: string, id: string, body: RetentionPolicyAction) {
    return this.http.post<RetentionPolicy>(
      `${this.base(tenant)}/policies/${encodeURIComponent(id)}/actions`,
      body,
    );
  }
  createHold(tenant: string, body: CreateRetentionHold) {
    return this.http.post<RetentionHold>(`${this.base(tenant)}/holds`, body);
  }
  releaseHold(tenant: string, id: string, body: ReleaseRetentionHold) {
    return this.http.post<RetentionHold>(
      `${this.base(tenant)}/holds/${encodeURIComponent(id)}/release`,
      body,
    );
  }
  context(tenant: string, entryId: string) {
    return this.http.get<RetentionContextView>(
      `${this.base(tenant)}/activities/${encodeURIComponent(entryId)}/context`,
    );
  }
  createPreview(tenant: string, body: CreateRetentionPreview) {
    return this.http.post<RetentionPreviewPage>(`${this.base(tenant)}/previews`, body);
  }
  preview(tenant: string, id: string, cursor?: string) {
    return this.http.get<RetentionPreviewPage>(
      `${this.base(tenant)}/previews/${encodeURIComponent(id)}`,
      { params: { limit: 20, ...(cursor ? { cursor } : {}) } },
    );
  }
}
