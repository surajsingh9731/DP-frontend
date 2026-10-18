import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegisterApiService } from '../../core/api/register-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { RegisterContextView, RegisterEntryView } from '../../core/api/contracts';

/** Data register (Module B) — every data type an organisation collects, with its legal basis and retention. Pure "what/why/how long", no participant identity here. */
@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly registerApi = inject(RegisterApiService);
  private readonly fb = inject(FormBuilder);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly entries = signal<RegisterEntryView[] | null | undefined>(undefined);
  readonly context = signal<RegisterContextView | null | undefined>(undefined);

  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    categoryCode: ['', Validators.required],
    purposeEn: ['', Validators.required],
    purposeHi: ['', Validators.required],
    legalBasis: ['consent' as 'consent' | 'legitimate_use', Validators.required],
    retentionDays: [365, [Validators.required, Validators.min(1)]],
    hasPaperRecords: [false],
  });

  constructor() {
    this.loadEntries();
    this.loadContext();
  }

  private loadEntries(): void {
    this.registerApi.list().subscribe({
      next: (entries) => this.entries.set(entries),
      error: () => this.entries.set(null),
    });
  }

  private loadContext(): void {
    this.registerApi.context().subscribe({
      next: (context) => this.context.set(context),
      error: () => this.context.set(null),
    });
  }

  onCategoryChange(code: string): void {
    const category = this.context()?.dataCategories.find((c) => c.code === code);
    if (category) {
      this.form.patchValue({
        legalBasis: category.suggestedLegalBasis,
        retentionDays: category.suggestedRetentionDays,
      });
    }
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
    this.registerApi
      .create(
        {
          categoryCode: value.categoryCode,
          purposeEn: value.purposeEn,
          purposeHi: value.purposeHi,
          legalBasis: value.legalBasis,
          retentionDays: value.retentionDays,
          hasPaperRecords: value.hasPaperRecords,
          vendorReferences: [],
          storageReferences: [],
        },
        crypto.randomUUID(),
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.form.reset({
            categoryCode: '',
            purposeEn: '',
            purposeHi: '',
            legalBasis: 'consent',
            retentionDays: 365,
            hasPaperRecords: false,
          });
          this.loadEntries();
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }
}
