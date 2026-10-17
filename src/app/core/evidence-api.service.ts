import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { EvidencePage, EvidenceDetail, EvidenceFilters } from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';
@Injectable({ providedIn: 'root' })
export class EvidenceApi {
  private readonly http = inject(HttpClient);
  private base(tenant: string) {
    return `${API_BASE}/tenants/${encodeURIComponent(tenant)}/evidence`;
  }
  list(tenant: string, filters: EvidenceFilters) {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(filters))
      if (value !== undefined && value !== '') params = params.set(key, String(value));
    return this.http.get<EvidencePage>(this.base(tenant), { params });
  }
  detail(tenant: string, kind: string, id: string, version: number) {
    return this.http.get<EvidenceDetail>(
      `${this.base(tenant)}/${encodeURIComponent(kind)}/${encodeURIComponent(id)}/${version}`,
    );
  }
}
