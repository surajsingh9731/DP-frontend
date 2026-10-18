import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import type { MembershipRole, StaffMemberView } from './contracts';

export interface InviteStaffPayload {
  displayName: string;
  identifier: string;
  role: MembershipRole;
  language: 'en' | 'hi';
}

@Injectable({ providedIn: 'root' })
export class StaffApiService {
  private readonly api = inject(ApiClientService);

  list(): Observable<StaffMemberView[]> {
    return this.api.get<StaffMemberView[]>('/staff');
  }

  invite(payload: InviteStaffPayload, idempotencyKey: string): Observable<StaffMemberView> {
    return this.api.post<StaffMemberView>('/staff/invite', { ...payload, idempotencyKey });
  }

  updateRole(
    membershipId: string,
    role: MembershipRole,
    version: number,
    idempotencyKey: string,
  ): Observable<StaffMemberView> {
    return this.api.put<StaffMemberView>(`/staff/${membershipId}/role`, {
      role,
      version,
      idempotencyKey,
    });
  }

  remove(membershipId: string, idempotencyKey: string): Observable<void> {
    return this.api.delete<void>(`/staff/${membershipId}`, { idempotencyKey });
  }
}
