import { API_BASE } from '../constants/api.constants';
export { API_BASE } from '../constants/api.constants';
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import type { MailView, SessionView, TaskView, WorkspaceView } from '@sahmati/contracts';

@Injectable({ providedIn: 'root' })
export class Api {
  private readonly http = inject(HttpClient);
  readonly session = signal<SessionView | null>(null);
  me() {
    return this.http
      .get<SessionView>(`${API_BASE}/auth/me`)
      .pipe(tap((value) => this.session.set(value)));
  }
  challenge(email: string, language: 'en' | 'hi') {
    return this.http.post<{ challengeId: string; message: string }>(`${API_BASE}/auth/challenges`, {
      email,
      language,
    });
  }
  verify(challengeId: string, code: string) {
    return this.http.post<{ signedIn: boolean }>(`${API_BASE}/auth/verify`, { challengeId, code });
  }
  logout() {
    return this.http.post(`${API_BASE}/auth/logout`, {}).pipe(tap(() => this.session.set(null)));
  }
  summary(tenantId: string) {
    return this.http.get<WorkspaceView>(
      `${API_BASE}/tenants/${encodeURIComponent(tenantId)}/summary`,
    );
  }
  createTask(tenantId: string, idempotencyKey: string, language: 'en' | 'hi') {
    return this.http.post<TaskView>(`${API_BASE}/tenants/${encodeURIComponent(tenantId)}/tasks`, {
      template: 'review_inventory',
      idempotencyKey,
      language,
    });
  }
  closeTask(tenantId: string, id: string, version: number) {
    return this.http.post<TaskView>(
      `${API_BASE}/tenants/${encodeURIComponent(tenantId)}/tasks/${encodeURIComponent(id)}/close`,
      { version },
    );
  }
  mail() {
    return this.http.get<MailView[]>(`${API_BASE}/dev/mail`);
  }
}
