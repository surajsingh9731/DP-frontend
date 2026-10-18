import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthCardComponent } from '../../../auth/auth-card/auth-card.component';
import { ParticipantApiService } from '../../../../core/api/participant-api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { ApiError } from '../../../../core/api/api-client.service';
import type { AuthChannel } from '../../../../core/api/contracts';

/**
 * The one OTP flow every public participant journey routes through —
 * reused from the Privacy Center, from "my consent" and from "my rights
 * requests" alike (Workflow Addition 4 explicitly reuses one verification
 * flow rather than building a parallel one per destination). No account is
 * created; a successful confirm just stores a short-lived token scoped to
 * this organisation.
 */
@Component({
  selector: 'app-participant-verify',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, AuthCardComponent],
  templateUrl: './participant-verify.component.html',
  styleUrl: './participant-verify.component.scss',
})
export class ParticipantVerifyComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly participantApi = inject(ParticipantApiService);
  readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;
  readonly orgSlug = this.route.snapshot.paramMap.get('orgSlug') ?? '';
  private readonly nextPath = this.route.snapshot.queryParamMap.get('next');

  readonly step = signal<'identifier' | 'code'>('identifier');
  readonly identifier = signal('');
  readonly code = signal('');
  readonly verificationId = signal('');
  readonly maskedIdentifier = signal('');
  readonly channel = signal<AuthChannel>('whatsapp');
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly title = computed(() =>
    this.step() === 'identifier'
      ? this.language() === 'hi'
        ? 'अपना मोबाइल नंबर या ईमेल दें'
        : 'Enter your mobile number or email'
      : this.language() === 'hi'
        ? 'कोड दर्ज करें'
        : 'Enter the code',
  );

  readonly subtitle = computed(() =>
    this.step() === 'identifier'
      ? this.language() === 'hi'
        ? 'हम आपकी पहचान जाँचने के लिए एक कोड भेजेंगे — कोई पासवर्ड नहीं, कोई खाता नहीं।'
        : 'We will send a code to confirm it is you — no password, no account.'
      : this.maskedIdentifier()
        ? this.language() === 'hi'
          ? `${this.maskedIdentifier()} पर भेजा गया कोड`
          : `Code sent to ${this.maskedIdentifier()}`
        : '',
  );

  sendCode(): void {
    if (!this.identifier().trim()) {
      this.errorMessage.set(
        this.language() === 'hi'
          ? 'मोबाइल नंबर या ईमेल दर्ज करें।'
          : 'Enter a mobile number or email.',
      );
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    this.participantApi.startVerification(this.orgSlug, this.identifier().trim(), this.language()).subscribe({
      next: (challenge) => {
        this.submitting.set(false);
        this.verificationId.set(challenge.verificationId);
        this.maskedIdentifier.set(challenge.maskedIdentifier);
        this.channel.set(challenge.channel);
        this.step.set('code');
      },
      error: (error: ApiError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  confirmCode(): void {
    if (this.code().length !== 6) {
      this.errorMessage.set(
        this.language() === 'hi' ? '6 अंकों का कोड दर्ज करें।' : 'Enter the 6-digit code.',
      );
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    this.participantApi
      .confirmVerification(this.orgSlug, this.verificationId(), this.code())
      .subscribe({
        next: (session) => {
          this.submitting.set(false);
          this.participantApi.storeSession(this.orgSlug, session);
          void this.router.navigateByUrl(
            this.nextPath ? `/${this.orgSlug}/${this.nextPath}` : `/${this.orgSlug}/my-consent`,
          );
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }

  backToIdentifier(): void {
    this.step.set('identifier');
    this.code.set('');
    this.errorMessage.set(null);
  }
}
