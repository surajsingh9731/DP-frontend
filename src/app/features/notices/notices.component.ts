import { PreparationApi } from '../../core/preparation-api.service';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of, type Observable } from 'rxjs';
import type {
  NoticeSnapshotView,
  RegisterView,
  PreparationRecordView,
  TemplatePreparationData,
  NoticePreparationInput,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { I18n } from '../../core/i18n.service';
import { RegisterApi } from '../../core/register-api.service';
import { NoticesApi, type DecideNotice } from '../../core/notices-api.service';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import {
  NOTICE_COMMENT_LIMIT,
  NOTICE_LANGUAGES,
  NOTICE_EXPORT_FILENAMES,
} from '../../constants/notices.constants';
import { noticeActionKey } from './notice-idempotency';
import { NOTICES_EN, type NoticesTextKey } from './notices.en';
import { NOTICES_HI } from './notices.hi';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DisplayPreferencesComponent],
  templateUrl: './notices.component.html',
  styleUrl: './notices.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoticesComponent {
  readonly i = inject(I18n);
  private readonly api = inject(Api);
  private readonly registerApi = inject(RegisterApi);
  private readonly noticesApi = inject(NoticesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly preparationApi = inject(PreparationApi);
  readonly tenantId = signal('');
  readonly routeNoticeId = signal('');
  readonly entries = signal<RegisterView[]>([]);
  readonly notices = signal<NoticeSnapshotView[]>([]);
  readonly selected = signal<NoticeSnapshotView | null>(null);
  readonly chosenEntry = signal<RegisterView | null>(null);
  readonly entryChoice = new FormControl('', { nonNullable: true });
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly detailsBusy = signal(false);
  readonly error = signal<NoticesTextKey | ''>('');
  readonly notice = signal<NoticesTextKey | ''>('');
  readonly owner = computed(() => this.role() === 'owner');
  readonly canSubmit = computed(() => this.owner() || this.role() === 'staff');
  readonly canDecide = computed(() => this.owner() && this.selected()?.status === 'in_review');
  readonly previousSelection = computed(() => {
    const chosen = this.chosenEntry();
    return (
      !!chosen &&
      !this.entries().some((entry) => entry.id === chosen.id && entry.version === chosen.version)
    );
  });
  readonly language = new FormControl<'en' | 'hi'>(this.i.locale(), { nonNullable: true });
  readonly comment = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(NOTICE_COMMENT_LIMIT)],
  });
  readonly acknowledged = new FormControl(false, { nonNullable: true });
  readonly languages = NOTICE_LANGUAGES;
  readonly commentLimit = NOTICE_COMMENT_LIMIT;
  readonly exportFilenames = NOTICE_EXPORT_FILENAMES;
  private readonly snapshotLanguage = toSignal(this.language.valueChanges, {
    initialValue: this.language.value,
  });
  readonly preparationRecords = signal<PreparationRecordView[]>([]);
  readonly preparationLoading = signal(false);
  readonly usePreparation = new FormControl(false, { nonNullable: true });
  readonly templateChoice = new FormControl('', { nonNullable: true });
  readonly contactChoice = new FormControl('', { nonNullable: true });
  readonly readyTemplates = computed(() =>
    this.preparationRecords().filter((record) => {
      if (record.kind !== 'template' || record.status !== 'internally_reviewed') return false;
      const data = record.data as TemplatePreparationData;
      const pack = this.chosenEntry()?.sourcePack;
      return (
        data.language === this.snapshotLanguage() &&
        (!record.sourcePack ||
          (pack?.id === record.sourcePack.id && pack.version === record.sourcePack.version))
      );
    }),
  );
  readonly readyContacts = computed(() =>
    this.preparationRecords().filter(
      (record) => record.kind === 'contact' && record.status === 'internally_reviewed',
    ),
  );
  preparationLabel(record: PreparationRecordView): string {
    return 'title' in record.data ? record.data.title : record.data.displayName;
  }
  loadPreparation(): void {
    if (this.busy() || this.preparationLoading()) return;
    const tenant = this.tenantId();
    this.preparationLoading.set(true);
    this.preparationApi.list(tenant).subscribe({
      next: (records) => {
        if (tenant !== this.tenantId()) return;
        this.preparationRecords.set(records);
        this.preparationLoading.set(false);
      },
      error: () => {
        if (tenant !== this.tenantId()) return;
        this.preparationLoading.set(false);
        this.error.set('failed');
      },
    });
  }
  private preparationSelection(): NoticePreparationInput | null {
    const template = this.readyTemplates().find(
      (record) => record.id === this.templateChoice.value,
    );
    const contact = this.readyContacts().find((record) => record.id === this.contactChoice.value);
    return template && contact
      ? {
          templateId: template.id,
          templateVersion: template.version,
          contactId: contact.id,
          contactVersion: contact.version,
        }
      : null;
  }
  exportUrl(id: string, format: keyof typeof NOTICE_EXPORT_FILENAMES): string {
    return this.noticesApi.exportUrl(this.tenantId(), id, format);
  }
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.routeNoticeId.set(params.get('noticeId') ?? '');
      this.entries.set([]);
      this.notices.set([]);
      this.selected.set(null);
      this.chosenEntry.set(null);
      this.entryChoice.reset();
      this.preparationRecords.set([]);
      this.preparationLoading.set(false);
      this.usePreparation.reset();
      this.templateChoice.reset();
      this.contactChoice.reset();
      this.comment.reset();
      this.acknowledged.reset();
      this.busy.set(false);
      this.detailsBusy.set(false);
      this.load();
    });
  }
  private role() {
    return this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role;
  }
  t(key: NoticesTextKey): string {
    return this.i.locale() === 'hi' ? NOTICES_HI[key] : NOTICES_EN[key];
  }
  message(key: NoticesTextKey | ''): string {
    return key ? this.t(key) : '';
  }
  entryKey(entry: RegisterView): string {
    return `${entry.id}:${entry.version}`;
  }
  chooseEntry(event: Event): void {
    const key = (event.target as HTMLSelectElement).value;
    this.chosenEntry.set(this.entries().find((entry) => this.entryKey(entry) === key) ?? null);
  }
  load(clearError = true): void {
    const tenant = this.tenantId();
    if (this.busy()) return;
    this.loading.set(true);
    if (clearError) this.error.set('');
    forkJoin({
      entries: this.registerApi.list(tenant),
      notices: this.noticesApi.list(tenant),
      snapshot: this.routeNoticeId() ? this.noticesApi.get(tenant, this.routeNoticeId()) : of(null),
    }).subscribe({
      next: (value) => {
        if (tenant !== this.tenantId()) return;
        this.entries.set(value.entries);
        this.notices.set(value.notices);
        const selected = this.selected();
        if (value.snapshot) this.selected.set(value.snapshot);
        else if (selected)
          this.selected.set(value.notices.find((item) => item.id === selected.id) ?? null);
        this.loading.set(false);
      },
      error: () => {
        if (tenant !== this.tenantId()) return;
        this.entries.set([]);
        this.notices.set([]);
        this.selected.set(null);
        this.loading.set(false);
        this.error.set('unavailable');
      },
    });
  }
  select(item: NoticeSnapshotView): void {
    if (this.busy() || this.detailsBusy()) return;
    const tenant = this.tenantId();
    this.detailsBusy.set(true);
    this.error.set('');
    this.notice.set('');
    this.noticesApi.get(tenant, item.id).subscribe({
      next: (saved) => {
        if (tenant !== this.tenantId()) return;
        this.selected.set(saved);
        this.comment.reset();
        this.acknowledged.reset();
        this.detailsBusy.set(false);
      },
      error: () => {
        if (tenant !== this.tenantId()) return;
        this.detailsBusy.set(false);
        this.error.set('failed');
      },
    });
  }
  async submit(): Promise<void> {
    if (!this.canSubmit() || this.busy() || this.loading()) return;
    const entry = this.chosenEntry();
    if (!entry || !this.languages.includes(this.language.value)) {
      this.error.set('invalid');
      return;
    }
    const preparation = this.usePreparation.value ? this.preparationSelection() : null;
    if (this.usePreparation.value && !preparation) {
      this.error.set('preparationInvalid');
      return;
    }
    const payload = {
      ...(preparation ? { preparation } : {}),
      entryId: entry.id,
      entryVersion: entry.version,
      language: this.language.value,
    };
    const tenant = this.tenantId();
    await this.mutate(
      'submit',
      payload,
      (key) => this.noticesApi.submit(tenant, { ...payload, idempotencyKey: key }),
      'submitted',
    );
  }
  async decide(decision: DecideNotice['decision']): Promise<void> {
    const selected = this.selected();
    if (!this.canDecide() || !selected || this.busy() || this.loading()) return;
    const comment = this.comment.value.trim();
    if (this.comment.invalid || (decision === 'request_changes' && !comment)) {
      this.comment.markAsTouched();
      this.error.set('commentRequired');
      return;
    }
    if (decision === 'publish_sample' && !this.acknowledged.value) {
      this.error.set('acknowledgementRequired');
      return;
    }
    const payload = {
      version: selected.reviewVersion,
      decision,
      ...(comment ? { comment } : {}),
      ...(decision === 'publish_sample' ? { sampleOnlyAcknowledged: true as const } : {}),
    };
    const tenant = this.tenantId();
    await this.mutate(
      'decision',
      { snapshotId: selected.id, ...payload },
      (key) => this.noticesApi.decide(tenant, selected.id, { ...payload, idempotencyKey: key }),
      'decisionSaved',
    );
  }
  private async mutate(
    action: string,
    identity: object,
    request: (key: string) => Observable<NoticeSnapshotView>,
    success: NoticesTextKey,
  ): Promise<void> {
    const tenant = this.tenantId();
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      const key = await noticeActionKey(tenant, action, identity);
      if (tenant !== this.tenantId()) return;
      request(key).subscribe({
        next: (saved) => {
          if (tenant !== this.tenantId()) return;
          this.busy.set(false);
          this.selected.set(saved);
          this.notices.update((items) => [saved, ...items.filter((item) => item.id !== saved.id)]);
          this.notice.set(success);
          if (action === 'submit') this.load(false);
        },
        error: (error: HttpErrorResponse) => {
          if (tenant !== this.tenantId()) return;
          this.busy.set(false);
          this.error.set(error.status === 409 ? 'conflict' : 'failed');
          if (error.status === 409) this.load(false);
        },
      });
    } catch {
      if (tenant === this.tenantId()) {
        this.busy.set(false);
        this.error.set('failed');
      }
    }
  }
}
