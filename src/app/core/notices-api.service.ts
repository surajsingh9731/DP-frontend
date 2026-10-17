import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  CreateNoticeInput as SubmitNotice,
  NoticeDecisionInput as DecideNotice,
  NoticeSnapshotView,
} from '@sahmati/contracts';
export type { NoticeDecisionInput as DecideNotice } from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';
import { NOTICE_EXPORT_PATHS } from '../constants/notices.constants';

@Injectable({ providedIn: 'root' })
export class NoticesApi {
  private readonly http = inject(HttpClient);
  private path(tenantId: string): string {
    return `${API_BASE}/tenants/${encodeURIComponent(tenantId)}/notices`;
  }
  list(tenantId: string) {
    return this.http.get<NoticeSnapshotView[]>(this.path(tenantId));
  }
  get(tenantId: string, id: string) {
    return this.http.get<NoticeSnapshotView>(`${this.path(tenantId)}/${encodeURIComponent(id)}`);
  }
  exportUrl(tenantId: string, id: string, format: keyof typeof NOTICE_EXPORT_PATHS): string {
    return `${this.path(tenantId)}/${encodeURIComponent(id)}/${NOTICE_EXPORT_PATHS[format]}`;
  }
  submit(tenantId: string, data: SubmitNotice) {
    return this.http.post<NoticeSnapshotView>(this.path(tenantId), data);
  }
  decide(tenantId: string, id: string, data: DecideNotice) {
    return this.http.post<NoticeSnapshotView>(
      `${this.path(tenantId)}/${encodeURIComponent(id)}/decisions`,
      data,
    );
  }
}
