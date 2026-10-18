import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { OrganisationSettingsView } from './contracts';

export interface UpdateSettingsPayload {
  organisationName: string;
  contactName?: string;
  contactRole?: string;
  contactPhone?: string;
  contactEmail?: string;
  version: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly api = inject(ApiClientService);

  get(): Observable<OrganisationSettingsView> {
    return this.api.get<OrganisationSettingsView>('/settings');
  }

  update(payload: UpdateSettingsPayload, idempotencyKey: string): Observable<OrganisationSettingsView> {
    return this.api.put<OrganisationSettingsView>('/settings', { ...payload, idempotencyKey });
  }
}
