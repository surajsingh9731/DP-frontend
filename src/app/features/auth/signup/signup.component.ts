import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthCardComponent } from '../auth-card/auth-card.component';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { SectorPacksApiService } from '../../../core/api/sector-packs-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { ApiError } from '../../../core/api/api-client.service';

/**
 * Creates the organisation + owner account and issues the first OTP
 * challenge. The sector pack list is fetched from `/sector-packs`, never
 * hardcoded — a ninth pack appearing server-side needs no frontend change
 * (same "data-driven, not an if-branch" rule the backend follows).
 */
@Component({
  selector: 'app-signup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthCardComponent],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss',
})
export class SignupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly sectorPacksApi = inject(SectorPacksApiService);
  private readonly router = inject(Router);
  readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;

  readonly sectorPacks = toSignal(this.sectorPacksApi.list(), { initialValue: [] });
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    organisationName: ['', [Validators.required, Validators.minLength(2)]],
    sectorPackCode: ['', Validators.required],
    ownerDisplayName: ['', [Validators.required, Validators.minLength(2)]],
    ownerIdentifier: ['', Validators.required],
  });

  readonly title = computed(() =>
    this.language() === 'hi' ? 'अपना खाता बनाएँ' : 'Create your organisation',
  );

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    const value = this.form.getRawValue();
    this.authApi
      .signup({
        organisationName: value.organisationName,
        sectorPackCode: value.sectorPackCode,
        ownerDisplayName: value.ownerDisplayName,
        ownerIdentifier: value.ownerIdentifier,
        language: this.language(),
      })
      .subscribe({
        next: (challenge) => {
          this.submitting.set(false);
          void this.router.navigate(['/get-started/verify', challenge.challengeId], {
            state: { maskedIdentifier: challenge.maskedIdentifier, channel: challenge.channel },
          });
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }
}
