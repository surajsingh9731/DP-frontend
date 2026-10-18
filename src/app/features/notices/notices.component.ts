import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NoticesApiService } from '../../core/api/notices-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { NoticeView } from '../../core/api/contracts';

/** Privacy notice (Module C) — the plain-language notice built from the data register, published for parents/principals to read. */
@Component({
  selector: 'app-notices',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './notices.component.html',
  styleUrl: './notices.component.scss',
})
export class NoticesComponent {
  private readonly noticesApi = inject(NoticesApiService);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly notice = signal<NoticeView | null | undefined>(undefined);
  readonly publishing = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    this.noticesApi.current().subscribe({
      next: (notice) => this.notice.set(notice),
      error: () => this.notice.set(undefined),
    });
  }

  publish(): void {
    this.publishing.set(true);
    this.errorMessage.set(null);
    this.noticesApi.publish(crypto.randomUUID()).subscribe({
      next: (notice) => {
        this.publishing.set(false);
        this.notice.set(notice);
      },
      error: (error: ApiError) => {
        this.publishing.set(false);
        this.errorMessage.set(error.message);
      },
    });
  }
}
