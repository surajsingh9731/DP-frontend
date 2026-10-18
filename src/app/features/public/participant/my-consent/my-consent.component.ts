import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ParticipantApiService } from '../../../../core/api/participant-api.service';
import { LanguageService } from '../../../../core/services/language.service';
import { ApiError } from '../../../../core/api/api-client.service';
import type { ConsentStatusItem } from '../../../../core/api/contracts';

/**
 * A verified data principal's own consent status, purpose by purpose —
 * Workflow Addition 4 / US-W4.2. Reuses the same record/withdraw endpoints
 * the organisation's own consent-capture screen uses; this page is a second
 * entry point onto the same engine, not a parallel implementation of it.
 */
@Component({
  selector: 'app-my-consent',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './my-consent.component.html',
  styleUrl: './my-consent.component.scss',
})
export class MyConsentComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly participantApi = inject(ParticipantApiService);
  readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;
  readonly orgSlug = this.route.snapshot.paramMap.get('orgSlug') ?? '';

  readonly loading = signal(true);
  readonly items = signal<ConsentStatusItem[]>([]);
  readonly available = signal(true);
  readonly busyId = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly copy = computed(() =>
    this.language() === 'hi'
      ? {
          title: 'मेरी सहमति',
          loading: 'लोड हो रहा है…',
          unavailable: 'इस संस्थान ने अभी तक अपनी सूचना प्रकाशित नहीं की है।',
          noPurposes: 'अभी कोई उद्देश्य उपलब्ध नहीं है।',
          given: 'सहमति दी गई',
          declined: 'अस्वीकार किया गया',
          notDecided: 'अभी तय नहीं',
          withdraw: 'सहमति वापस लें',
          giveConsent: 'सहमति दें',
          backLink: '← गोपनीयता केंद्र पर वापस जाएँ',
        }
      : {
          title: 'My consent',
          loading: 'Loading…',
          unavailable: "This organisation hasn't published its notice yet.",
          noPurposes: 'No purposes are available right now.',
          given: 'Consent given',
          declined: 'Declined',
          notDecided: 'Not decided yet',
          withdraw: 'Withdraw consent',
          giveConsent: 'Give consent',
          backLink: '← Back to the Privacy Center',
        },
  );

  constructor() {
    this.participantApi.status(this.orgSlug).subscribe({
      next: (result) => {
        this.loading.set(false);
        this.available.set(result.available);
        this.items.set(result.items);
      },
      error: (error: ApiError) => {
        this.loading.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }

  giveConsent(item: ConsentStatusItem): void {
    this.act(item, 'accept');
  }

  withdraw(item: ConsentStatusItem): void {
    this.busyId.set(item.registerEntryId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.participantApi.withdraw(this.orgSlug, [item.registerEntryId], crypto.randomUUID()).subscribe({
      next: () => {
        this.busyId.set(null);
        this.applyLocalUpdate(item.registerEntryId, 'decline');
        this.successMessage.set(
          this.language() === 'hi' ? 'आपकी सहमति वापस ले ली गई है।' : 'Your consent has been withdrawn.',
        );
      },
      error: (error: ApiError) => {
        this.busyId.set(null);
        this.errorMessage.set(error.message);
      },
    });
  }

  private act(item: ConsentStatusItem, decision: 'accept' | 'decline'): void {
    this.busyId.set(item.registerEntryId);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.participantApi
      .recordChoices(this.orgSlug, [{ registerEntryId: item.registerEntryId, decision }], crypto.randomUUID())
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.applyLocalUpdate(item.registerEntryId, decision);
          this.successMessage.set(
            this.language() === 'hi' ? 'आपकी पसंद सहेज ली गई है।' : 'Your choice has been saved.',
          );
        },
        error: (error: ApiError) => {
          this.busyId.set(null);
          this.errorMessage.set(error.message);
        },
      });
  }

  private applyLocalUpdate(registerEntryId: string, decision: 'accept' | 'decline'): void {
    this.items.set(
      this.items().map((entry) =>
        entry.registerEntryId === registerEntryId
          ? { ...entry, decision, occurredAt: new Date().toISOString() }
          : entry,
      ),
    );
  }
}
