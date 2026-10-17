import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin, of, type Observable } from 'rxjs';
import type {
  ConsentReceipt,
  FollowupAssignee,
  FollowupDetail,
  FollowupTask,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { FollowupsApi } from '../../core/followups-api.service';
import { ConsentApi } from '../../core/consent-api.service';
import { I18n } from '../../core/i18n.service';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { storedActionKey } from '../../core/commands/stored-action-key';
import { FOLLOWUP_KEY_PREFIX, FOLLOWUP_LIMITS } from '../../constants/followups.constants';
import { followupActionForm, followupActions, followupReferences } from './followups.forms';
import { FOLLOWUPS_EN, type FollowupsTextKey } from './followups.en';
import { FOLLOWUPS_HI } from './followups.hi';
@Component({
  selector: 'app-followups',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, DisplayPreferencesComponent],
  templateUrl: './followups.component.html',
  styleUrl: './followups.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FollowupsComponent {
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('detailHeading');
  readonly i = inject(I18n);
  private readonly api = inject(Api);
  private readonly followups = inject(FollowupsApi);
  private readonly consent = inject(ConsentApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private generation = 0;
  readonly tenantId = signal('');
  readonly tasks = signal<FollowupTask[]>([]);
  readonly selected = signal<FollowupDetail | null>(null);
  readonly assignees = signal<FollowupAssignee[]>([]);
  readonly receipts = signal<ConsentReceipt[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<FollowupsTextKey | ''>('');
  readonly status = signal<FollowupsTextKey | ''>('');
  readonly role = computed(
    () => this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role,
  );
  readonly owner = computed(() => this.role() === 'owner');
  readonly canAct = computed(() => this.owner() || this.role() === 'staff');
  readonly actions = computed(() =>
    this.selected() && this.canAct() ? followupActions(this.selected()!, this.owner()) : [],
  );
  readonly form = followupActionForm();
  readonly receiptId = new FormControl('', { nonNullable: true });
  readonly createAcknowledged = new FormControl(false, { nonNullable: true });
  readonly limits = FOLLOWUP_LIMITS;
  t(key: FollowupsTextKey) {
    return this.i.locale() === 'hi' ? FOLLOWUPS_HI[key] : FOLLOWUPS_EN[key];
  }
  message(key: FollowupsTextKey | '') {
    return key ? this.t(key) : '';
  }
  location(task: FollowupTask): string {
    return task.location.kind === 'unmapped'
      ? this.t(task.location.name === 'paper' ? 'unknownPaper' : 'unknownOther')
      : task.location.name;
  }
  constructor() {
    afterRenderEffect(() => {
      if (this.selected()) this.heading()?.nativeElement.focus();
    });
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.tasks.set([]);
      this.selected.set(null);
      this.assignees.set([]);
      this.receipts.set([]);
      this.form.reset();
      this.receiptId.reset();
      this.createAcknowledged.reset();
      this.busy.set(false);
      void this.load(params.get('taskId') ?? undefined);
    });
  }
  private value<T>(request: Observable<T>) {
    return firstValueFrom(request.pipe(takeUntilDestroyed(this.destroy)));
  }
  private failure(error: unknown) {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    this.error.set(
      status === 409
        ? 'conflict'
        : status === 403
          ? 'forbidden'
          : status === 404
            ? 'unavailable'
            : status === 400
              ? 'invalid'
              : 'failed',
    );
  }
  async load(id = this.selected()?.id): Promise<void> {
    if (this.busy()) return;
    const tenant = this.tenantId(),
      generation = ++this.generation;
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.value(
        forkJoin({
          tasks: this.followups.list(tenant),
          assignees: this.followups.assignees(tenant),
          receipts: this.owner() ? this.consent.ledger(tenant) : of([]),
          detail: id ? this.followups.get(tenant, id) : of(null),
        }),
      );
      if (tenant !== this.tenantId() || generation !== this.generation) return;
      this.tasks.set(result.tasks);
      this.assignees.set(result.assignees);
      this.receipts.set(result.receipts.filter((r) => r.kind === 'choices_withdrawn'));
      this.selected.set(result.detail);
      this.form.reset();
      if (result.detail) {
        this.form.controls.assigneeId.setValue(result.detail.assignee?.id ?? '');
        this.form.controls.action.setValue(this.actions()[0] ?? 'block');
      }
    } catch (error) {
      if (tenant === this.tenantId() && generation === this.generation) {
        this.selected.set(null);
        this.failure(error);
      }
    } finally {
      if (tenant === this.tenantId() && generation === this.generation) this.loading.set(false);
    }
  }
  async select(id: string) {
    if (this.busy() || this.loading()) return;
    this.status.set('');
    await this.load(id);
  }
  async create(): Promise<void> {
    if (!this.owner() || this.busy() || this.loading()) return;
    if (!this.receiptId.value || !this.createAcknowledged.value) {
      this.error.set('invalid');
      return;
    }
    const tenant = this.tenantId(),
      payload = { receiptId: this.receiptId.value };
    await this.mutate('create', payload, (key) =>
      this.followups.create(tenant, payload.receiptId, key),
    );
  }
  async act(): Promise<void> {
    const task = this.selected();
    if (!task || !this.canAct() || this.busy() || this.loading()) return;
    const values = this.form.getRawValue(),
      references = followupReferences(values.references);
    if (this.form.invalid || !references || !this.actions().includes(values.action)) {
      this.form.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    const payload = {
      version: task.version,
      action: values.action,
      note: values.note.trim(),
      evidenceRefs: references,
      ...(values.action === 'assign' ? { assigneeId: values.assigneeId || null } : {}),
      syntheticOnlyAcknowledged: true as const,
    };
    const tenant = this.tenantId();
    await this.mutate(`action:${task.id}`, payload, (key) =>
      this.followups.action(tenant, task.id, { ...payload, idempotencyKey: key }),
    );
  }
  private async mutate(
    action: string,
    payload: object,
    request: (key: string) => Observable<FollowupTask | FollowupTask[]>,
  ): Promise<void> {
    const tenant = this.tenantId();
    this.busy.set(true);
    this.error.set('');
    this.status.set('');
    try {
      const key = await storedActionKey(FOLLOWUP_KEY_PREFIX, tenant, action, payload);
      if (tenant !== this.tenantId()) return;
      const result = await this.value(request(key));
      if (tenant !== this.tenantId()) return;
      this.busy.set(false);
      await this.load(Array.isArray(result) ? result[0]?.id : result.id);
      if (tenant === this.tenantId() && !this.error()) this.status.set('saved');
    } catch (error) {
      if (tenant === this.tenantId()) this.failure(error);
    } finally {
      if (tenant === this.tenantId()) this.busy.set(false);
    }
  }
}
