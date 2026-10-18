import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { VendorsApiService } from '../../core/api/vendors-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { VendorView } from '../../core/api/contracts';

/** Vendor register (Module J) — companies that handle the organisation's data, their agreement status, and deletion-instruction evidence. */
@Component({
  selector: 'app-vendors',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './vendors.component.html',
  styleUrl: './vendors.component.scss',
})
export class VendorsComponent {
  private readonly vendorsApi = inject(VendorsApiService);
  private readonly fb = inject(FormBuilder);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly vendors = signal<VendorView[] | null | undefined>(undefined);
  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly actingOnId = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    serviceDescription: ['', Validators.required],
    contactEmail: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.vendorsApi.list().subscribe({
      next: (vendors) => this.vendors.set(vendors),
      error: () => this.vendors.set(null),
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
    this.vendorsApi.create(this.form.getRawValue(), crypto.randomUUID()).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showForm.set(false);
        this.form.reset({ name: '', serviceDescription: '', contactEmail: '' });
        this.load();
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  sendAgreement(vendor: VendorView): void {
    this.actingOnId.set(vendor.id);
    this.vendorsApi.sendAgreement(vendor.id, crypto.randomUUID()).subscribe({
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

  markSigned(vendor: VendorView): void {
    this.actingOnId.set(vendor.id);
    this.vendorsApi.recordAgreementSigned(vendor.id, crypto.randomUUID()).subscribe({
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
