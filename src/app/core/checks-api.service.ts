import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type {
  CheckDetail,
  CheckEvaluation,
  TaskEvidenceReview,
  MappingResult,
  ReviewEvidenceInput,
  ResolveLocationInput,
  EvaluateChecksInput,
} from '@sahmati/contracts';
import { API_BASE } from '../constants/api.constants';
@Injectable({ providedIn: 'root' })
export class ChecksApi {
  private readonly http = inject(HttpClient);
  private path(tenant: string, id: string) {
    return `${API_BASE}/tenants/${encodeURIComponent(tenant)}/checks/tasks/${encodeURIComponent(id)}`;
  }
  get(tenant: string, id: string) {
    return this.http.get<CheckDetail>(this.path(tenant, id));
  }
  evaluate(tenant: string, id: string, payload: EvaluateChecksInput) {
    return this.http.post<CheckEvaluation>(`${this.path(tenant, id)}/evaluations`, payload);
  }
  review(tenant: string, id: string, payload: ReviewEvidenceInput) {
    return this.http.post<TaskEvidenceReview>(`${this.path(tenant, id)}/reviews`, payload);
  }
  map(tenant: string, id: string, payload: ResolveLocationInput) {
    return this.http.post<MappingResult>(`${this.path(tenant, id)}/mapping`, payload);
  }
}
