import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { SectorPackSummary } from './contracts';

@Injectable({ providedIn: 'root' })
export class SectorPacksApiService {
  private readonly api = inject(ApiClientService);

  list(): Observable<SectorPackSummary[]> {
    return this.api.get<SectorPackSummary[]>('/sector-packs');
  }
}
