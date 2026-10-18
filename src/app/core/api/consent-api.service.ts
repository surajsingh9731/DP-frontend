import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { ConsentLedgerItemView } from './contracts';

@Injectable({ providedIn: 'root' })
export class ConsentApiService {
  private readonly api = inject(ApiClientService);

  ledger(kind?: string): Observable<ConsentLedgerItemView[]> {
    return this.api.get<ConsentLedgerItemView[]>(
      kind ? `/consent/ledger?kind=${encodeURIComponent(kind)}` : '/consent/ledger',
    );
  }
}
