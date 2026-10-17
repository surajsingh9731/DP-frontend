import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of, type Observable } from 'rxjs';
import type {
  PreparationKind,
  PreparationRecordView,
  TemplatePreparationData,
  ContactPreparationData,
  PreparationActionInput,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { PreparationApi } from '../../core/preparation-api.service';
import { I18n } from '../../core/i18n.service';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { storedActionKey } from '../../core/commands/stored-action-key';
import {
  PREPARATION_LIMITS,
  PREPARATION_KEY_PREFIX,
  PREPARATION_LANGUAGES,
} from '../../constants/preparation.constants';
import { templateForm, contactForm } from './preparation.forms';
import { PREPARATION_EN, type PreparationTextKey } from './preparation.en';
import { PREPARATION_HI } from './preparation.hi';
@Component({
  selector: 'app-preparation',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, RouterLink, DisplayPreferencesComponent],
  templateUrl: './preparation.component.html',
  styleUrl: './preparation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreparationComponent {
  readonly i = inject(I18n);
  private readonly api = inject(Api);
  private readonly preparation = inject(PreparationApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private generation = 0;
  readonly tenantId = signal('');
  readonly records = signal<PreparationRecordView[]>([]);
  readonly selected = signal<PreparationRecordView | null>(null);
  readonly kind = signal<PreparationKind>('template');
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal<PreparationTextKey | ''>('');
  readonly notice = signal<PreparationTextKey | ''>('');
  readonly owner = computed(() => this.role() === 'owner');
  readonly canPrepareTemplate = computed(() => this.owner() || this.role() === 'staff');
  readonly canEdit = computed(
    () => this.owner() || (this.role() === 'staff' && this.kind() === 'template'),
  );
  readonly canSubmit = computed(
    () => this.canEdit() && ['draft', 'changes_requested'].includes(this.selected()?.status ?? ''),
  );
  readonly canReview = computed(() => this.owner() && this.selected()?.status === 'in_review');
  readonly template = templateForm();
  readonly contact = contactForm();
  readonly comment = new FormControl('', {
    nonNullable: true,
    validators: [Validators.maxLength(PREPARATION_LIMITS.comment)],
  });
  readonly acknowledged = new FormControl(false, { nonNullable: true });
  readonly limits = PREPARATION_LIMITS;
  readonly languages = PREPARATION_LANGUAGES;
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.records.set([]);
      this.selected.set(null);
      this.busy.set(false);
      this.resetForms();
      this.load();
    });
  }
  private role() {
    return this.api.session()?.memberships.find((member) => member.tenantId === this.tenantId())
      ?.role;
  }
  t(key: PreparationTextKey): string {
    return this.i.locale() === 'hi' ? PREPARATION_HI[key] : PREPARATION_EN[key];
  }
  message(key: PreparationTextKey | ''): string {
    return key ? this.t(key) : '';
  }
  label(record: PreparationRecordView): string {
    return 'title' in record.data ? record.data.title : record.data.displayName;
  }
  activeForm() {
    return this.kind() === 'template' ? this.template : this.contact;
  }
  historyData(record: PreparationRecordView['history'][number]): string {
    return JSON.stringify(record.data, null, 2);
  }
  private resetForms() {
    this.template.reset();
    this.contact.reset();
    this.template.controls.language.setValue(this.i.locale());
    this.comment.reset();
    this.acknowledged.reset();
  }
  newDraft(kind: PreparationKind): void {
    if (this.busy() || this.loading()) return;
    this.selected.set(null);
    this.kind.set(kind);
    this.resetForms();
    this.error.set('');
    this.notice.set('');
  }
  preset(): void {
    if (!this.canEdit() || this.busy()) return;
    this.template.patchValue({
      title: this.t('presetTitle'),
      body: this.t('presetBody'),
      language: this.i.locale(),
      sourceKind: 'education-sample',
    });
    this.template.markAsDirty();
  }
  private adopt(record: PreparationRecordView): void {
    this.selected.set(record);
    this.kind.set(record.kind);
    if (record.kind === 'template') this.template.reset(record.data as TemplatePreparationData);
    else this.contact.reset(record.data as ContactPreparationData);
    this.comment.reset();
    this.acknowledged.reset();
  }
  load(selectedId?: string): void {
    if (this.busy()) return;
    const tenant = this.tenantId(),
      generation = ++this.generation;
    this.loading.set(true);
    forkJoin({
      records: this.preparation.list(tenant),
      record: selectedId ? this.preparation.get(tenant, selectedId) : of(null),
    })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (value) => {
          if (tenant !== this.tenantId() || generation !== this.generation) return;
          this.records.set(value.records);
          if (value.record) this.adopt(value.record);
          this.loading.set(false);
        },
        error: () => {
          if (tenant !== this.tenantId() || generation !== this.generation) return;
          this.records.set([]);
          this.loading.set(false);
          this.error.set('unavailable');
        },
      });
  }
  select(record: PreparationRecordView): void {
    if (this.busy() || this.loading()) return;
    this.error.set('');
    this.notice.set('');
    this.load(record.id);
  }
  async save(): Promise<void> {
    if (!this.canEdit() || this.busy() || this.loading()) return;
    const form = this.activeForm();
    if (form.invalid) {
      form.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    const data =
      this.kind() === 'template' ? this.template.getRawValue() : this.contact.getRawValue();
    const id = this.selected()?.id,
      kind = this.kind(),
      tenant = this.tenantId();
    const payload = { ...data, version: this.selected()?.version ?? 0 };
    await this.mutate(
      `save:${kind}`,
      { id: id ?? null, ...payload },
      (key) => this.preparation.save(tenant, kind, { ...payload, idempotencyKey: key }, id),
      'saved',
    );
  }
  async act(action: PreparationActionInput['action']): Promise<void> {
    const selected = this.selected();
    if (
      !selected ||
      this.busy() ||
      this.loading() ||
      (action === 'submit' ? !this.canSubmit() : !this.canReview())
    )
      return;
    if (this.activeForm().dirty) {
      this.error.set('unsaved');
      return;
    }
    const comment = this.comment.value.trim();
    if (this.comment.invalid || (action !== 'submit' && !comment)) {
      this.error.set('commentRequired');
      return;
    }
    if (action === 'review_internal' && !this.acknowledged.value) {
      this.error.set('ackRequired');
      return;
    }
    const payload = {
      version: selected.version,
      action,
      ...(comment ? { comment } : {}),
      ...(action === 'review_internal' ? { internalOnlyAcknowledged: true as const } : {}),
    };
    const tenant = this.tenantId();
    await this.mutate(
      'action',
      { id: selected.id, ...payload },
      (key) => this.preparation.action(tenant, selected.id, { ...payload, idempotencyKey: key }),
      'actionSaved',
    );
  }
  private async mutate(
    action: string,
    payload: object,
    request: (key: string) => Observable<PreparationRecordView>,
    success: PreparationTextKey,
  ): Promise<void> {
    const tenant = this.tenantId();
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    try {
      const key = await storedActionKey(PREPARATION_KEY_PREFIX, tenant, action, payload);
      if (tenant !== this.tenantId()) return;
      request(key)
        .pipe(takeUntilDestroyed(this.destroy))
        .subscribe({
          next: (saved) => {
            if (tenant !== this.tenantId()) return;
            this.busy.set(false);
            this.notice.set(success);
            this.load(saved.id);
          },
          error: (error: HttpErrorResponse) => {
            if (tenant !== this.tenantId()) return;
            this.busy.set(false);
            this.error.set(error.status === 409 ? 'conflict' : 'failed');
            if (error.status === 409) this.load();
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
