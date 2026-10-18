import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { DashboardCheckView } from './contracts';

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private readonly api = inject(ApiClientService);

  readiness(): Observable<DashboardCheckView[]> {
    return this.api.get<DashboardCheckView[]>('/dashboard/readiness');
  }
}
