import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StaffApiService } from '../../core/api/staff-api.service';
import { SessionService } from '../../core/services/session.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { MembershipRole, StaffMemberView } from '../../core/api/contracts';

/** Staff management (Module A) — invite staff/viewers, change roles, remove access. */
@Component({
  selector: 'app-staff',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss',
})
export class StaffComponent {
  private readonly staffApi = inject(StaffApiService);
  private readonly fb = inject(FormBuilder);
  private readonly session = inject(SessionService);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly isOwner = () => this.session.session()?.role === 'owner';

  readonly members = signal<StaffMemberView[] | null | undefined>(undefined);
  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly actingOnId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    identifier: ['', Validators.required],
    role: ['staff' as MembershipRole, Validators.required],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.staffApi.list().subscribe({
      next: (members) => this.members.set(members),
      error: () => this.members.set(null),
    });
  }

  toggleForm(): void {
    this.showForm.update((v) => !v);
    this.errorMessage.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const value = this.form.getRawValue();
    this.staffApi
      .invite({ ...value, language: this.language() }, crypto.randomUUID())
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.form.reset({ displayName: '', identifier: '', role: 'staff' });
          this.load();
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }

  changeRole(member: StaffMemberView, role: MembershipRole): void {
    if (role === member.role) return;
    this.actingOnId.set(member.membershipId);
    this.errorMessage.set(null);
    this.staffApi.updateRole(member.membershipId, role, member.version, crypto.randomUUID()).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.actingOnId.set(null);
        this.errorMessage.set(error.message);
      },
    });
  }

  remove(member: StaffMemberView): void {
    this.actingOnId.set(member.membershipId);
    this.errorMessage.set(null);
    this.staffApi.remove(member.membershipId, crypto.randomUUID()).subscribe({
      next: () => {
        this.actingOnId.set(null);
        this.load();
      },
      error: (error: ApiError) => {
        this.actingOnId.set(null);
        this.errorMessage.set(error.message);
      },
    });
  }
}
