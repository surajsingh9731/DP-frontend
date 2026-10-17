import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { RegisterData, SectorPackView, SetupView } from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';

export interface SaveSetup {
  version: number;
  organisationName: string;
  packId: string;
  packVersion: number;
  step: 1 | 2 | 3;
  draft: RegisterData | null;
}

@Injectable({ providedIn: 'root' })
export class SetupApi {
  private readonly http = inject(HttpClient);
  private path(tenantId: string): string {
    return `${API_BASE}/tenants/${encodeURIComponent(tenantId)}/setup`;
  }
  get(tenantId: string) {
    return this.http.get<{ setup: SetupView | null; packs: SectorPackView[] }>(this.path(tenantId));
  }
  save(tenantId: string, data: SaveSetup) {
    return this.http.put<SetupView>(this.path(tenantId), data);
  }
  complete(tenantId: string, version: number, idempotencyKey: string) {
    return this.http.post<SetupView>(`${this.path(tenantId)}/complete`, {
      version,
      idempotencyKey,
    });
  }
}
