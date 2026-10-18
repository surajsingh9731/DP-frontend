import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { CommissionRecordView, CommissionStatus, PartnerOrganisationView, PartnerProfileView } from './contracts';

export interface UpsertPartnerProfilePayload {
  brandName: string;
  logoRef?: string;
  contactEmail: string;
}

@Injectable({ providedIn: 'root' })
export class PartnerApiService {
  private readonly api = inject(ApiClientService);

  myOrganisations(): Observable<PartnerOrganisationView[]> {
    return this.api.get<PartnerOrganisationView[]>('/partner/organisations');
  }

  getProfile(): Observable<PartnerProfileView | null> {
    return this.api.get<PartnerProfileView | null>('/partner/profile');
  }

  upsertProfile(payload: UpsertPartnerProfilePayload): Observable<PartnerProfileView> {
    return this.api.put<PartnerProfileView>('/partner/profile', payload);
  }

  listCommissions(): Observable<CommissionRecordView[]> {
    return this.api.get<CommissionRecordView[]>('/partner/commissions');
  }

  updateCommissionStatus(id: string, status: CommissionStatus): Observable<CommissionRecordView> {
    return this.api.put<CommissionRecordView>(`/partner/commissions/${id}/status`, { status });
  }
}
