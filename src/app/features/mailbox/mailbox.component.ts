import { DEMO_ACCOUNTS } from '../../constants/demo.constants';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import type { MailView } from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { I18n, type TextKey } from '../../core/i18n.service';
import { IconComponent } from '../../core/icon.component';
@Component({
  selector: 'app-mailbox',
  standalone: true,
  imports: [RouterLink, DatePipe, IconComponent],
  templateUrl: './mailbox.component.html',
  styleUrl: './mailbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MailboxComponent {
  readonly i = inject(I18n);
  readonly api = inject(Api);
  readonly mail = signal<MailView[]>([]);
  readonly filter = signal('');
  readonly error = signal<TextKey | ''>('');
  readonly busy = signal(false);
  readonly accounts = DEMO_ACCOUNTS;
  readonly messages = computed(() =>
    this.mail().filter((m) => !this.filter() || m.recipient === this.filter()),
  );
  constructor() {
    this.load();
  }
  load(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .mail()
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (mail) => this.mail.set(mail),
        error: () => this.error.set('genericError'),
      });
  }
}
