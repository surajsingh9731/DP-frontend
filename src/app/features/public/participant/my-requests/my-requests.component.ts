import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParticipantApiService } from '../../../../core/api/participant-api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { ApiError } from '../../../../core/api/api-client.service';
import type { RightsRequestKind, RightsRequestView } from '../../../../core/api/contracts';

const KINDS: RightsRequestKind[] = ['access', 'correction', 'erasure', 'grievance', 'nomination'];

/**
 * A verified data principal submitting and tracking their own rights
 * requests — Workflow Addition 4 / US-G3/US-W4.3. The Owner-side desk
 * (module G) works the same requests; this is only the public submit/track
 * entry point onto it, never a second request pipeline.
 */
@Component({
  selector: 'app-my-requests',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, DatePipe],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss',
})
export class MyRequestsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly participantApi = inject(ParticipantApiService);
  readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;
  readonly orgSlug = this.route.snapshot.paramMap.get('orgSlug') ?? '';

  readonly kinds = KINDS;
  readonly kind = signal<RightsRequestKind>('access');
  readonly details = signal('');
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly loadingRequests = signal(true);
  readonly requests = signal<RightsRequestView[]>([]);

  readonly copy = computed(() =>
    this.language() === 'hi'
      ? {
          title: 'अपने अधिकार माँगें',
          kindLabel: 'आप क्या चाहते हैं?',
          detailsLabel: 'विवरण',
          detailsPlaceholder: 'अपनी बात यहाँ लिखें…',
          submit: 'भेजें',
          submitting: 'भेजा जा रहा है…',
          historyTitle: 'मेरी पिछली माँगें',
          loading: 'लोड हो रहा है…',
          none: 'अभी कोई माँग नहीं है।',
          dueBy: 'जवाब की समय सीमा',
          backLink: '← गोपनीयता केंद्र पर वापस जाएँ',
          kinds: {
            access: 'मेरा डेटा देखें (access)',
            correction: 'गलती ठीक करें (correction)',
            erasure: 'मेरा डेटा हटाएँ (erasure)',
            grievance: 'शिकायत (grievance)',
            nomination: 'नॉमिनी जोड़ें (nomination)',
          } as Record<RightsRequestKind, string>,
          status: {
            requested: 'दर्ज की गई',
            under_review: 'समीक्षा में',
            responded: 'जवाब दिया गया',
            closed: 'बंद',
          } as Record<string, string>,
        }
      : {
          title: 'My rights requests',
          kindLabel: 'What do you need?',
          detailsLabel: 'Details',
          detailsPlaceholder: 'Tell us what you need…',
          submit: 'Submit',
          submitting: 'Submitting…',
          historyTitle: 'My past requests',
          loading: 'Loading…',
          none: 'You have no requests yet.',
          dueBy: 'Response due by',
          backLink: '← Back to the Privacy Center',
          kinds: {
            access: 'See my data (access)',
            correction: 'Fix something wrong (correction)',
            erasure: 'Delete my data (erasure)',
            grievance: 'Complaint (grievance)',
            nomination: 'Add a nominee (nomination)',
          } as Record<RightsRequestKind, string>,
          status: {
            requested: 'Requested',
            under_review: 'Under review',
            responded: 'Responded',
            closed: 'Closed',
          } as Record<string, string>,
        },
  );

  constructor() {
    this.loadRequests();
  }

  submit(): void {
    if (!this.details().trim()) {
      this.errorMessage.set(
        this.language() === 'hi' ? 'कृपया विवरण लिखें।' : 'Please add some detail.',
      );
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);
    this.participantApi
      .submitRequest(this.orgSlug, this.kind(), this.details().trim(), crypto.randomUUID())
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.details.set('');
          this.loadRequests();
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }

  private loadRequests(): void {
    this.loadingRequests.set(true);
    this.participantApi.myRequests(this.orgSlug).subscribe({
      next: (list) => {
        this.loadingRequests.set(false);
        this.requests.set(list);
      },
      error: () => {
        this.loadingRequests.set(false);
      },
    });
  }
}
