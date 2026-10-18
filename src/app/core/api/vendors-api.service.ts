import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { VendorDeletionInstructionView, VendorView } from './contracts';

export interface CreateVendorPayload {
  name: string;
  serviceDescription: string;
  contactEmail: string;
}

@Injectable({ providedIn: 'root' })
export class VendorsApiService {
  private readonly api = inject(ApiClientService);

  list(): Observable<VendorView[]> {
    return this.api.get<VendorView[]>('/vendors');
  }

  get(id: string): Observable<VendorView> {
    return this.api.get<VendorView>(`/vendors/${id}`);
  }

  create(payload: CreateVendorPayload, idempotencyKey: string): Observable<VendorView> {
    return this.api.post<VendorView>('/vendors', { ...payload, idempotencyKey });
  }

  sendAgreement(id: string, idempotencyKey: string): Observable<VendorView> {
    return this.api.post<VendorView>(`/vendors/${id}/agreement/send`, { idempotencyKey });
  }

  recordAgreementSigned(
    id: string,
    idempotencyKey: string,
    agreementDocumentRef?: string,
  ): Observable<VendorView> {
    return this.api.post<VendorView>(`/vendors/${id}/agreement/signed`, {
      agreementDocumentRef,
      idempotencyKey,
    });
  }

  listDeletionInstructions(vendorId?: string): Observable<VendorDeletionInstructionView[]> {
    return this.api.get<VendorDeletionInstructionView[]>(
      vendorId
        ? `/vendors/deletion-instructions?vendorId=${encodeURIComponent(vendorId)}`
        : '/vendors/deletion-instructions',
    );
  }
}
