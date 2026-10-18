import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthCardComponent } from '../auth-card/auth-card.component';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { ApiError } from '../../../core/api/api-client.service';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, AuthCardComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  private readonly router = inject(Router);
  readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    identifier: ['', Validators.required],
  });

  readonly title = computed(() => (this.language() === 'hi' ? 'साइन इन करें' : 'Sign in'));

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    this.authApi
      .login({ identifier: this.form.getRawValue().identifier, language: this.language() })
      .subscribe({
        next: (challenge) => {
          this.submitting.set(false);
          void this.router.navigate(['/sign-in/verify', challenge.challengeId], {
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
