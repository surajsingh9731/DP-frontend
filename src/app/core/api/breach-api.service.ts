import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { BreachIncidentView } from './contracts';

export interface ReportBreachPayload {
  title: string;
  description: string;
  discoveredAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedDataCategories: string[];
  affectedPrincipalsCount?: number;
}

export interface RecordBreachEventPayload {
  eventType: 'contained' | 'dpb_notified' | 'principals_notified' | 'closed';
  notes?: string;
  version: number;
}

@Injectable({ providedIn: 'root' })
export class BreachApiService {
  private readonly api = inject(ApiClientService);

  list(status?: string): Observable<BreachIncidentView[]> {
    return this.api.get<BreachIncidentView[]>(
      status ? `/breach/incidents?status=${encodeURIComponent(status)}` : '/breach/incidents',
    );
  }

  get(id: string): Observable<BreachIncidentView> {
    return this.api.get<BreachIncidentView>(`/breach/incidents/${id}`);
  }

  report(payload: ReportBreachPayload, idempotencyKey: string): Observable<BreachIncidentView> {
    return this.api.post<BreachIncidentView>('/breach/incidents', { ...payload, idempotencyKey });
  }

  recordEvent(
    id: string,
    payload: RecordBreachEventPayload,
    idempotencyKey: string,
  ): Observable<BreachIncidentView> {
    return this.api.post<BreachIncidentView>(`/breach/incidents/${id}/events`, {
      ...payload,
      idempotencyKey,
    });
  }
}
