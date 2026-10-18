import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SettingsApiService } from '../../core/api/settings-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { OrganisationSettingsView } from '../../core/api/contracts';

/**
 * Organisation settings (Module A) — the contact person published on every
 * notice and reply (s.8(9)), plus branches at a glance.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly settingsApi = inject(SettingsApiService);
  private readonly fb = inject(FormBuilder);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly settings = signal<OrganisationSettingsView | null | undefined>(undefined);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    organisationName: ['', [Validators.required, Validators.minLength(2)]],
    contactName: [''],
    contactRole: [''],
    contactPhone: [''],
    contactEmail: ['', Validators.email],
  });

  constructor() {
    this.settingsApi.get().subscribe({
      next: (settings) => {
        this.settings.set(settings);
        this.form.setValue({
          organisationName: settings.organisationName,
          contactName: settings.contactName ?? '',
          contactRole: settings.contactRole ?? '',
          contactPhone: settings.contactPhone ?? '',
          contactEmail: settings.contactEmail ?? '',
        });
      },
      error: () => this.settings.set(null),
    });
  }

  submit(): void {
    const current = this.settings();
    if (!current || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    const value = this.form.getRawValue();
    this.settingsApi
      .update(
        {
          organisationName: value.organisationName,
          contactName: value.contactName || undefined,
          contactRole: value.contactRole || undefined,
          contactPhone: value.contactPhone || undefined,
          contactEmail: value.contactEmail || undefined,
          version: current.version,
        },
        crypto.randomUUID(),
      )
      .subscribe({
        next: (settings) => {
          this.submitting.set(false);
          this.settings.set(settings);
          this.successMessage.set(
            this.language() === 'hi' ? 'सहेज लिया गया।' : 'Saved.',
          );
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }
}
