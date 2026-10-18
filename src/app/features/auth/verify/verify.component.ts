import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthCardComponent } from '../auth-card/auth-card.component';
import { AuthApiService } from '../../../core/api/auth-api.service';
import { LanguageService } from '../../../core/services/language.service';
import { ApiError } from '../../../core/api/api-client.service';

interface VerifyNavState {
  maskedIdentifier?: string;
  channel?: 'email' | 'whatsapp';
}

/** Shared OTP entry for both the signup and sign-in flows — the challenge id in the URL is all either flow needs to resolve the right account. */
@Component({
  selector: 'app-verify',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AuthCardComponent],
  templateUrl: './verify.component.html',
  styleUrl: './verify.component.scss',
})
export class VerifyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authApi = inject(AuthApiService);
  readonly languageService = inject(LanguageService);

  private readonly navState = (this.router.getCurrentNavigation()?.extras.state ??
    history.state) as VerifyNavState;

  readonly language = this.languageService.language;
  readonly challengeId = this.route.snapshot.paramMap.get('challengeId') ?? '';
  readonly maskedIdentifier = this.navState.maskedIdentifier ?? '';
  readonly code = signal('');
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly title = computed(() => (this.language() === 'hi' ? 'कोड दर्ज करें' : 'Enter the code'));

  submit(): void {
    if (this.code().length !== 6) {
      this.errorMessage.set(
        this.language() === 'hi' ? '6 अंकों का कोड दर्ज करें।' : 'Enter the 6-digit code.',
      );
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    this.authApi.verify(this.challengeId, this.code()).subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigateByUrl('/app');
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
