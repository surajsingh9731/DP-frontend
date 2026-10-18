import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RetentionApiService } from '../../core/api/retention-api.service';
import { LanguageService } from '../../core/services/language.service';
import { ApiError } from '../../core/api/api-client.service';
import type { RetentionPreviewItemView } from '../../core/api/contracts';

type ActionKind = 'hold' | 'erase';

/** Retention and erasure (Module I) — what's past its keep-until date, and the real actions (hold or erase) staff take on it. */
@Component({
  selector: 'app-retention',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, DatePipe],
  templateUrl: './retention.component.html',
  styleUrl: './retention.component.scss',
})
export class RetentionComponent {
  private readonly retentionApi = inject(RetentionApiService);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly preview = signal<RetentionPreviewItemView[] | null | undefined>(undefined);
  readonly activeItem = signal<RetentionPreviewItemView | null>(null);
  readonly activeAction = signal<ActionKind | null>(null);
  readonly noteText = signal('');
  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    this.retentionApi.preview().subscribe({
      next: (preview) => this.preview.set(preview),
      error: () => this.preview.set(null),
    });
  }

  openAction(item: RetentionPreviewItemView, action: ActionKind): void {
    this.activeItem.set(item);
    this.activeAction.set(action);
    this.noteText.set('');
    this.errorMessage.set(null);
  }

  closeAction(): void {
    this.activeItem.set(null);
    this.activeAction.set(null);
  }

  confirm(): void {
    const item = this.activeItem();
    const action = this.activeAction();
    if (!item || !action) return;
    if (!this.noteText().trim()) {
      this.errorMessage.set(this.language() === 'hi' ? 'कारण लिखें।' : 'Write a reason.');
      return;
    }
    this.submitting.set(true);
    this.errorMessage.set(null);
    const onSuccess = (): void => {
      this.submitting.set(false);
      this.closeAction();
      this.load();
    };
    const onError = (error: ApiError): void => {
      this.submitting.set(false);
      this.errorMessage.set(error.message);
    };
    if (action === 'hold') {
      this.retentionApi
        .placeHold(item.registerEntryId, this.noteText(), crypto.randomUUID())
        .subscribe({ next: onSuccess, error: onError });
    } else {
      this.retentionApi
        .executeErasure(item.registerEntryId, this.noteText(), crypto.randomUUID())
        .subscribe({ next: onSuccess, error: onError });
    }
  }
}
