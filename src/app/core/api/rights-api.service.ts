import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { RightsRequestAdminView } from './contracts';

export interface RespondRightsRequestPayload {
  status: 'under_review' | 'responded' | 'closed';
  responseText: string;
  version: number;
}

@Injectable({ providedIn: 'root' })
export class RightsApiService {
  private readonly api = inject(ApiClientService);

  list(status?: string): Observable<RightsRequestAdminView[]> {
    return this.api.get<RightsRequestAdminView[]>(
      status ? `/rights/requests?status=${encodeURIComponent(status)}` : '/rights/requests',
    );
  }

  respond(
    id: string,
    payload: RespondRightsRequestPayload,
    idempotencyKey: string,
  ): Observable<RightsRequestAdminView> {
    return this.api.post<RightsRequestAdminView>(`/rights/requests/${id}/respond`, {
      ...payload,
      idempotencyKey,
    });
  }
}
