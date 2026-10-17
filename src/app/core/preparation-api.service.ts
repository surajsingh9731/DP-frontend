import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  PreparationRecordView,
  PreparationKind,
  SaveTemplatePreparation,
  SaveContactPreparation,
  PreparationActionInput,
} from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';
@Injectable({ providedIn: 'root' })
export class PreparationApi {
  private readonly http = inject(HttpClient);
  private path(tenantId: string): string {
    return `${API_BASE}/tenants/${encodeURIComponent(tenantId)}/preparation`;
  }
  list(tenantId: string) {
    return this.http.get<PreparationRecordView[]>(this.path(tenantId));
  }
  get(tenantId: string, id: string) {
    return this.http.get<PreparationRecordView>(`${this.path(tenantId)}/${encodeURIComponent(id)}`);
  }
  save(
    tenantId: string,
    kind: PreparationKind,
    data: SaveTemplatePreparation | SaveContactPreparation,
    id?: string,
  ) {
    const path = `${this.path(tenantId)}/${kind}s`;
    return id
      ? this.http.put<PreparationRecordView>(`${path}/${encodeURIComponent(id)}`, data)
      : this.http.post<PreparationRecordView>(path, data);
  }
  action(tenantId: string, id: string, data: PreparationActionInput) {
    return this.http.post<PreparationRecordView>(
      `${this.path(tenantId)}/${encodeURIComponent(id)}/actions`,
      data,
    );
  }
}
