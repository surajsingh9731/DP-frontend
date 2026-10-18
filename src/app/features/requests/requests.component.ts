import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RightsApiService } from '../../core/api/rights-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { RightsRequestAdminView } from '../../core/api/contracts';

/** Rights & grievance desk (Module G) — every access/correction/erasure/grievance/nomination request a parent or principal submitted, with a real reply workflow. */
@Component({
  selector: 'app-requests',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  templateUrl: './requests.component.html',
  styleUrl: './requests.component.scss',
})
export class RequestsComponent {
  private readonly rightsApi = inject(RightsApiService);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly requests = signal<RightsRequestAdminView[] | null | undefined>(undefined);
  readonly openRowId = signal<string | null>(null);
  readonly responseText = signal('');
  readonly responseStatus = signal<'under_review' | 'responded' | 'closed'>('under_review');
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    this.rightsApi.list().subscribe({
      next: (requests) => this.requests.set(requests),
      error: () => this.requests.set(null),
    });
  }

  toggleRow(request: RightsRequestAdminView): void {
    if (this.openRowId() === request.id) {
      this.openRowId.set(null);
      return;
    }
    this.openRowId.set(request.id);
    this.responseText.set(request.responseText ?? '');
    this.responseStatus.set(
      request.status === 'requested'
        ? 'under_review'
        : (request.status as 'under_review' | 'responded' | 'closed'),
    );
    this.errorMessage.set(null);
  }

  submit(request: RightsRequestAdminView): void {
    if (!this.responseText().trim()) {
      this.errorMessage.set(this.language() === 'hi' ? 'जवाब लिखें।' : 'Write a response.');
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    this.rightsApi
      .respond(
        request.id,
        {
          status: this.responseStatus(),
          responseText: this.responseText(),
          version: request.version,
        },
        crypto.randomUUID(),
      )
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.openRowId.set(null);
          this.load();
        },
        error: (error: ApiError) => {
          this.submitting.set(false);
          this.errorMessage.set(error.message);
        },
      });
  }
}
