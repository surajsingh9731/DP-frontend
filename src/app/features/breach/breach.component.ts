import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BreachApiService } from '../../core/api/breach-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { BreachIncidentView } from '../../core/api/contracts';

/** Breach desk (Module H) — incidents reported and tracked through CERT-In / Data Protection Board notification deadlines. */
@Component({
  selector: 'app-breach',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './breach.component.html',
  styleUrl: './breach.component.scss',
})
export class BreachComponent {
  private readonly breachApi = inject(BreachApiService);
  private readonly fb = inject(FormBuilder);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly incidents = signal<BreachIncidentView[] | null | undefined>(undefined);
  readonly showForm = signal(false);
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    discoveredAt: [new Date().toISOString().slice(0, 16), Validators.required],
    severity: ['medium' as 'low' | 'medium' | 'high' | 'critical', Validators.required],
    affectedDataCategories: ['', Validators.required],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.breachApi.list().subscribe({
      next: (incidents) => this.incidents.set(incidents),
      error: () => this.incidents.set(null),
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
    this.breachApi
      .report(
        {
          title: value.title,
          description: value.description,
          discoveredAt: new Date(value.discoveredAt).toISOString(),
          severity: value.severity,
          affectedDataCategories: value.affectedDataCategories
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
        },
        crypto.randomUUID(),
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.showForm.set(false);
          this.form.reset({
            title: '',
            description: '',
            discoveredAt: new Date().toISOString().slice(0, 16),
            severity: 'medium',
            affectedDataCategories: '',
          });
          this.load();
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }
}
