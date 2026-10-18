import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParticipantApiService } from '../../../../core/api/participant-api.service';
import { LanguageService } from '../../../../core/services/language.service';
import type { PublicNoticeView } from '../../../../core/api/contracts';

const UNAVAILABLE: PublicNoticeView = { available: false };

/**
 * The public, no-login landing page for one organisation's data
 * principals — Workflow Addition 4. Shows the current published notice,
 * the required contact person, and the two entry points into verified
 * personal actions. Never requires login to read; an unpublished or
 * unknown organisation gets a safe, generic unavailable page rather than
 * an error or a hint about what went wrong.
 */
@Component({
  selector: 'app-privacy-center',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './privacy-center.component.html',
  styleUrl: './privacy-center.component.scss',
})
export class PrivacyCenterComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly participantApi = inject(ParticipantApiService);
  readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;
  readonly orgSlug = this.route.snapshot.paramMap.get('orgSlug') ?? '';

  readonly notice = toSignal(
    this.participantApi.notice(this.orgSlug).pipe(catchError(() => of(UNAVAILABLE))),
    { initialValue: undefined },
  );

  readonly title = computed(() =>
    this.language() === 'hi' ? (this.notice()?.titleHi ?? '') : (this.notice()?.titleEn ?? ''),
  );
  readonly body = computed(() =>
    this.language() === 'hi' ? (this.notice()?.bodyHi ?? '') : (this.notice()?.bodyEn ?? ''),
  );

  readonly copy = computed(() =>
    this.language() === 'hi'
      ? {
          heading: 'गोपनीयता केंद्र',
          loading: 'लोड हो रहा है…',
          unavailableTitle: 'यह पेज अभी उपलब्ध नहीं है',
          unavailableBody:
            'यह लिंक किसी संस्थान से मेल नहीं खाता, या उसने अभी तक अपनी सूचना प्रकाशित नहीं की है।',
          contactHeading: 'संपर्क व्यक्ति',
          manageConsent: 'अपनी सहमति प्रबंधित करें',
          myRequests: 'सहायता / अपने अधिकार माँगें',
          signIn: '(मोबाइल नंबर या ईमेल से — कोई खाता नहीं बनाना)',
        }
      : {
          heading: 'Privacy Center',
          loading: 'Loading…',
          unavailableTitle: 'This page is not available right now',
          unavailableBody:
            "This link doesn't match an organisation, or it hasn't published its notice yet.",
          contactHeading: 'Contact person',
          manageConsent: 'Manage my consent',
          myRequests: 'Request help / use my rights',
          signIn: '(by mobile number or email — no account to create)',
        },
  );
}
