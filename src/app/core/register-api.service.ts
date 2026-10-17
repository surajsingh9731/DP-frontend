import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  NoticePreview,
  RegisterData,
  RegisterRevision,
  RegisterView,
} from '@sahmati/contracts';
import { API_BASE } from './api.service';
@Injectable({ providedIn: 'root' })
export class RegisterApi {
  private readonly http = inject(HttpClient);
  private path(tenantId: string): string {
    return `${API_BASE}/tenants/${encodeURIComponent(tenantId)}/register`;
  }
  list(tenantId: string) {
    return this.http.get<RegisterView[]>(this.path(tenantId));
  }
  create(tenantId: string, data: RegisterData) {
    return this.http.post<RegisterView>(this.path(tenantId), data);
  }
  update(tenantId: string, id: string, version: number, data: RegisterData) {
    return this.http.patch<RegisterView>(`${this.path(tenantId)}/${encodeURIComponent(id)}`, {
      ...data,
      version,
    });
  }
  history(tenantId: string, id: string) {
    return this.http.get<RegisterRevision[]>(
      `${this.path(tenantId)}/${encodeURIComponent(id)}/history`,
    );
  }
  preview(tenantId: string, id: string, language: 'en' | 'hi') {
    return this.http.get<NoticePreview>(
      `${this.path(tenantId)}/${encodeURIComponent(id)}/notice-preview`,
      { params: { language } },
    );
  }
}
