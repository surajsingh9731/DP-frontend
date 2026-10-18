import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { RegisterContextView, RegisterEntryView } from './contracts';

export interface RegisterEntryPayload {
  categoryCode: string;
  purposeEn: string;
  purposeHi: string;
  legalBasis: 'consent' | 'legitimate_use';
  legalBasisReason?: string;
  retentionDays?: number;
  hasPaperRecords: boolean;
  vendorReferences: { name: string; service: string }[];
  storageReferences: { name: string; location: string; medium: 'digital' | 'paper' }[];
}

@Injectable({ providedIn: 'root' })
export class RegisterApiService {
  private readonly api = inject(ApiClientService);

  context(): Observable<RegisterContextView> {
    return this.api.get<RegisterContextView>('/register/context');
  }

  list(): Observable<RegisterEntryView[]> {
    return this.api.get<RegisterEntryView[]>('/register');
  }

  create(payload: RegisterEntryPayload, idempotencyKey: string): Observable<RegisterEntryView> {
    return this.api.post<RegisterEntryView>('/register', { ...payload, idempotencyKey });
  }

  update(
    id: string,
    payload: RegisterEntryPayload & { version: number },
    idempotencyKey: string,
  ): Observable<RegisterEntryView> {
    return this.api.put<RegisterEntryView>(`/register/${id}`, { ...payload, idempotencyKey });
  }
}
