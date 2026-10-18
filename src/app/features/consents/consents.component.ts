import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ConsentApiService } from '../../core/api/consent-api.service';
import { LanguageService } from '../../core/services/language.service';
import type { ConsentLedgerItemView } from '../../core/api/contracts';

type KindFilter = 'all' | 'choices_recorded' | 'choices_withdrawn';

/**
 * Consent ledger (Module D/F) — the receipt trail of every choice a
 * parent/principal made. The "collect consent" QR/WhatsApp share tool
 * depends on the public (no-login) participant consent flow, which is
 * not built yet — this page stays to the real ledger data rather than
 * linking to a page that doesn't exist.
 */
@Component({
  selector: 'app-consents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './consents.component.html',
  styleUrl: './consents.component.scss',
})
export class ConsentsComponent {
  private readonly consentApi = inject(ConsentApiService);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly items = signal<ConsentLedgerItemView[] | null | undefined>(undefined);
  readonly filter = signal<KindFilter>('all');

  constructor() {
    this.load();
  }

  private load(): void {
    const kind = this.filter() === 'all' ? undefined : this.filter();
    this.items.set(undefined);
    this.consentApi.ledger(kind).subscribe({
      next: (items) => this.items.set(items),
      error: () => this.items.set(null),
    });
  }

  setFilter(filter: KindFilter): void {
    this.filter.set(filter);
    this.load();
  }
}
