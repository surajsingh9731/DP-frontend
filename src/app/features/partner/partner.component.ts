import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PartnerApiService } from '../../core/api/partner-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { CommissionRecordView, CommissionStatus, PartnerOrganisationView } from '../../core/api/contracts';

/** Partner portal (Module O) — an accountant/consultant's view across every client organisation they manage. */
@Component({
  selector: 'app-partner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './partner.component.html',
  styleUrl: './partner.component.scss',
})
export class PartnerComponent {
  private readonly partnerApi = inject(PartnerApiService);
  private readonly fb = inject(FormBuilder);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly organisations = signal<PartnerOrganisationView[] | null | undefined>(undefined);
  readonly commissions = signal<CommissionRecordView[] | null | undefined>(undefined);
  readonly hasProfile = signal(false);
  readonly showProfileForm = signal(false);
  readonly submitting = signal(false);
  readonly actingOnId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    brandName: ['', Validators.required],
    contactEmail: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.partnerApi.myOrganisations().subscribe({
      next: (list) => this.organisations.set(list),
      error: () => this.organisations.set(null),
    });
    this.partnerApi.listCommissions().subscribe({
      next: (list) => this.commissions.set(list),
      error: () => this.commissions.set(null),
    });
    this.partnerApi.getProfile().subscribe({
      next: (profile) => {
        this.hasProfile.set(profile !== null);
        this.showProfileForm.set(profile === null);
        if (profile) {
          this.profileForm.setValue({ brandName: profile.brandName, contactEmail: profile.contactEmail });
        }
      },
      error: () => undefined,
    });
  }

  toggleProfileForm(): void {
    this.showProfileForm.update((v) => !v);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.partnerApi.upsertProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.hasProfile.set(true);
        this.showProfileForm.set(false);
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  advanceCommission(record: CommissionRecordView): void {
    const next: CommissionStatus | null =
      record.status === 'pending' ? 'confirmed' : record.status === 'confirmed' ? 'paid' : null;
    if (!next) return;
    this.actingOnId.set(record.id);
    this.partnerApi.updateCommissionStatus(record.id, next).subscribe({
      next: (updated) => {
        this.actingOnId.set(null);
        this.commissions.update((list) =>
          (list ?? []).map((item) => (item.id === updated.id ? updated : item)),
        );
      },
      error: (error: ApiError) => {
        this.actingOnId.set(null);
        this.errorMessage.set(error.message);
      },
    });
  }
}
