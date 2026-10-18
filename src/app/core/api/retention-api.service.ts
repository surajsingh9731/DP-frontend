import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { RetentionActionView, RetentionHoldView, RetentionPreviewItemView } from './contracts';

@Injectable({ providedIn: 'root' })
export class RetentionApiService {
  private readonly api = inject(ApiClientService);

  preview(): Observable<RetentionPreviewItemView[]> {
    return this.api.get<RetentionPreviewItemView[]>('/retention/preview');
  }

  listHolds(): Observable<RetentionHoldView[]> {
    return this.api.get<RetentionHoldView[]>('/retention/holds');
  }

  placeHold(
    registerEntryId: string,
    reason: string,
    idempotencyKey: string,
  ): Observable<RetentionHoldView> {
    return this.api.post<RetentionHoldView>('/retention/holds', {
      registerEntryId,
      reason,
      idempotencyKey,
    });
  }

  releaseHold(id: string, idempotencyKey: string): Observable<RetentionHoldView> {
    return this.api.post<RetentionHoldView>(`/retention/holds/${id}/release`, { idempotencyKey });
  }

  executeErasure(
    registerEntryId: string,
    notes: string,
    idempotencyKey: string,
  ): Observable<RetentionActionView> {
    return this.api.post<RetentionActionView>('/retention/erasures', {
      registerEntryId,
      notes,
      idempotencyKey,
    });
  }
}
