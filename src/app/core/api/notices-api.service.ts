import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { NoticeView } from './contracts';

@Injectable({ providedIn: 'root' })
export class NoticesApiService {
  private readonly api = inject(ApiClientService);

  current(): Observable<NoticeView | null> {
    return this.api.get<NoticeView | null>('/notices/current');
  }

  publish(idempotencyKey: string): Observable<NoticeView> {
    return this.api.post<NoticeView>('/notices/publish', { idempotencyKey });
  }
}
