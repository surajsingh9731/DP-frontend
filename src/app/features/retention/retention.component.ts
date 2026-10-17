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
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, firstValueFrom, forkJoin, of, type Observable } from 'rxjs';
import type {
  RegisterView,
  RetentionPolicy,
  RetentionHold,
  RetentionContextView,
  RetentionPreviewPage,
  RetentionRecordDetail,
  RetentionPage,
  CreateRetentionPolicy,
  EditRetentionPolicy,
  RetentionPolicyAction,
  CreateRetentionHold,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { RegisterApi } from '../../core/register-api.service';
import { RetentionApi, type RetentionSavedPreview } from '../../core/retention-api.service';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { StatusBannerComponent } from '../../core/ui/status-banner/status-banner.component';
import { storedActionKey } from '../../core/commands/stored-action-key';
import { RETENTION_KEY_PREFIX, RETENTION_HOLD_SCOPES } from '../../constants/retention.constants';
import { RetentionCopy } from './retention-copy.service';
import type { RetentionTextKey } from './locales/en';
import {
  retentionPolicyForm,
  retentionHoldForm,
  retentionDecisionForm,
  retentionScenarioForm,
} from './retention.forms';
import { RetentionPreviewComponent } from './retention-preview.component';
@Component({
  selector: 'app-retention',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    DisplayPreferencesComponent,
    RetentionPreviewComponent,
    StatusBannerComponent,
  ],
  templateUrl: './retention.component.html',
  styleUrl: './retention.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetentionComponent {
  readonly copy = inject(RetentionCopy);
  private readonly api = inject(Api);
  private readonly register = inject(RegisterApi);
  private readonly retention = inject(RetentionApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private generation = 0;
  private attempt = crypto.randomUUID();
  private policyId = '';
  private holdId = '';
  private after: { policy?: string; hold?: string; snapshot?: string } = {};
  readonly tenantId = signal('');
  readonly entryId = signal('');
  readonly previewId = signal('');
  readonly entries = signal<RegisterView[]>([]);
  readonly policies = signal<RetentionPage<RetentionPolicy>>({ items: [], nextAfter: null });
  readonly holds = signal<RetentionPage<RetentionHold>>({ items: [], nextAfter: null });
  readonly snapshots = signal<RetentionPage<RetentionSavedPreview>>({ items: [], nextAfter: null });
  readonly context = signal<RetentionContextView | null>(null);
  readonly selectedPolicy = signal<RetentionRecordDetail<RetentionPolicy> | null>(null);
  readonly selectedHold = signal<RetentionRecordDetail<RetentionHold> | null>(null);
  readonly preview = signal<RetentionPreviewPage | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<RetentionTextKey | ''>('');
  readonly status = signal<RetentionTextKey | ''>('');
  readonly activity = new FormControl('', { nonNullable: true });
  readonly policyForm = retentionPolicyForm();
  readonly holdForm = retentionHoldForm();
  readonly decision = retentionDecisionForm();
  readonly holdDecision = retentionDecisionForm();
  readonly scenario = retentionScenarioForm();
  readonly holdScopes = RETENTION_HOLD_SCOPES;
  readonly owner = computed(() => this.role() === 'owner');
  readonly editor = computed(() => this.owner() || this.role() === 'staff');
  readonly entry = computed(() => this.entries().find((row) => row.id === this.entryId()) ?? null);
  private role() {
    return this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role;
  }
  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, query]) => {
        this.tenantId.set(params.get('tenantId') ?? '');
        this.entryId.set(query.get('entryId') ?? '');
        this.previewId.set(query.get('previewId') ?? '');
        this.activity.setValue(this.entryId());
        this.after = {};
        this.policyId = '';
        this.holdId = '';
        this.policyForm.reset();
        this.holdForm.reset();
        this.decision.reset();
        this.holdDecision.reset();
        this.scenario.reset();
        this.busy.set(false);
        this.clear();
        void this.load();
      });
  }
  private value<T>(request: Observable<T>) {
    return firstValueFrom(request.pipe(takeUntilDestroyed(this.destroy)));
  }
  private clear() {
    this.context.set(null);
    this.selectedPolicy.set(null);
    this.selectedHold.set(null);
    this.preview.set(null);
    this.policies.set({ items: [], nextAfter: null });
    this.holds.set({ items: [], nextAfter: null });
    this.snapshots.set({ items: [], nextAfter: null });
  }
  private failure(error: unknown) {
    const code = error instanceof HttpErrorResponse ? error.status : 0;
    this.error.set(
      code === 400
        ? 'invalid'
        : code === 409
          ? 'conflict'
          : code === 403
            ? 'forbidden'
            : code === 404
              ? 'unavailable'
              : 'failed',
    );
    if ([401, 403, 404].includes(code)) this.clear();
  }
  choose() {
    void this.router.navigate(['/workspace', this.tenantId(), 'retention'], {
      queryParams: { entryId: this.activity.value },
    });
  }
  async load() {
    if (this.busy()) return;
    const tenant = this.tenantId(),
      entryId = this.entryId(),
      generation = ++this.generation;
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.value(
        forkJoin({
          entries: this.register.list(tenant),
          policies:
            entryId && this.editor()
              ? this.retention.policies(tenant, entryId, this.after.policy)
              : of({ items: [], nextAfter: null }),
          holds:
            entryId && this.owner()
              ? this.retention.holds(tenant, entryId, this.after.hold)
              : of({ items: [], nextAfter: null }),
          snapshots:
            entryId && this.owner()
              ? this.retention.snapshots(tenant, entryId, this.after.snapshot)
              : of({ items: [], nextAfter: null }),
          context: entryId && this.owner() ? this.retention.context(tenant, entryId) : of(null),
          policy: this.policyId ? this.retention.policy(tenant, this.policyId) : of(null),
          hold: this.holdId && this.owner() ? this.retention.hold(tenant, this.holdId) : of(null),
          preview:
            this.previewId() && this.owner()
              ? this.retention.preview(tenant, this.previewId())
              : of(null),
        }),
      );
      if (tenant !== this.tenantId() || generation !== this.generation) return;
      this.entries.set(result.entries);
      this.policies.set(result.policies);
      this.holds.set(result.holds);
      this.snapshots.set(result.snapshots);
      this.context.set(result.context);
      this.selectedPolicy.set(result.policy);
      this.selectedHold.set(result.hold);
      this.preview.set(result.preview);
      if (result.policy)
        this.policyForm.reset({
          name: result.policy.record.name,
          durationDays: result.policy.record.durationDays,
          rationale: result.policy.record.rationale,
          ack: false,
        });
    } catch (error) {
      if (tenant === this.tenantId() && generation === this.generation) {
        this.clear();
        this.failure(error);
      }
    } finally {
      if (tenant === this.tenantId() && generation === this.generation) this.loading.set(false);
    }
  }
  first() {
    this.after = {};
    void this.load();
  }
  nextList(kind: 'policy' | 'hold' | 'snapshot') {
    const next =
      kind === 'policy'
        ? this.policies().nextAfter
        : kind === 'hold'
          ? this.holds().nextAfter
          : this.snapshots().nextAfter;
    if (next) {
      this.after[kind] = next;
      void this.load();
    }
  }
  newPolicy() {
    this.policyId = '';
    this.selectedPolicy.set(null);
    this.policyForm.reset();
    this.decision.reset();
  }
  inspectPolicy(id: string) {
    this.policyId = id;
    void this.load();
  }
  inspectHold(id: string) {
    this.holdId = id;
    void this.load();
  }
  openSnapshot(id: string) {
    void this.router.navigate(['/workspace', this.tenantId(), 'retention'], {
      queryParams: { entryId: this.entryId(), previewId: id },
    });
  }
  private async write<T>(
    action: string,
    payload: object,
    request: (key: string) => Observable<T>,
    done: (value: T) => void,
  ) {
    if (this.busy() || this.loading()) return;
    const tenant = this.tenantId(),
      entry = this.entryId(),
      generation = this.generation,
      current = () =>
        tenant === this.tenantId() && entry === this.entryId() && generation === this.generation;
    this.busy.set(true);
    this.error.set('');
    this.status.set('');
    try {
      const key = await storedActionKey(RETENTION_KEY_PREFIX, tenant, action, payload);
      if (!current()) return;
      const result = await this.value(request(key));
      if (!current()) return;
      done(result);
      this.attempt = crypto.randomUUID();
      this.after = {};
      this.decision.reset();
      this.holdDecision.reset();
      this.busy.set(false);
      await this.load();
      if (tenant === this.tenantId() && entry === this.entryId() && !this.error())
        this.status.set('saved');
    } catch (error) {
      if (current()) this.failure(error);
    } finally {
      if (current()) this.busy.set(false);
    }
  }
  savePolicy() {
    const entry = this.entry();
    if (!entry || !this.editor()) return;
    if (this.policyForm.invalid) {
      this.error.set('invalid');
      return;
    }
    const value = this.policyForm.getRawValue(),
      fields = {
        entryVersion: entry.version,
        name: value.name.trim(),
        durationDays: value.durationDays!,
        rationale: value.rationale.trim(),
        syntheticOnlyAcknowledged: true as const,
      },
      selected = this.selectedPolicy()?.record,
      payload = selected
        ? { ...fields, version: selected.version }
        : { ...fields, entryId: entry.id };
    void this.write(
      `policy:${selected?.id ?? this.attempt}`,
      payload,
      (key) =>
        selected
          ? this.retention.editPolicy(this.tenantId(), selected.id, {
              ...payload,
              idempotencyKey: key,
            } as EditRetentionPolicy)
          : this.retention.createPolicy(this.tenantId(), {
              ...payload,
              idempotencyKey: key,
            } as CreateRetentionPolicy),
      (row) => {
        this.policyId = row.id;
        this.policyForm.reset();
      },
    );
  }
  policyAction(action: RetentionPolicyAction['action']) {
    const row = this.selectedPolicy()?.record;
    if (!row || !this.editor() || (action !== 'submit' && !this.owner())) return;
    if (this.decision.invalid || (action === 'review' && !this.decision.controls.reviewAck.value)) {
      this.error.set('invalid');
      return;
    }
    const payload = {
      version: row.version,
      action,
      reason: this.decision.controls.reason.value.trim(),
      syntheticOnlyAcknowledged: true as const,
      ...(action === 'review' ? { internalReviewAcknowledged: true as const } : {}),
    };
    void this.write(
      `policy-action:${row.id}`,
      payload,
      (key) =>
        this.retention.policyAction(this.tenantId(), row.id, { ...payload, idempotencyKey: key }),
      () => {},
    );
  }
  createHold() {
    if (!this.owner() || !this.entry()) return;
    const value = this.holdForm.getRawValue();
    if (this.holdForm.invalid || (value.scope !== 'activity' && !value.target)) {
      this.error.set('invalid');
      return;
    }
    const payload: Omit<CreateRetentionHold, 'idempotencyKey'> = {
      entryId: this.entryId(),
      scope: value.scope,
      ...(value.scope !== 'activity' ? { target: value.target } : {}),
      reason: value.reason.trim(),
      syntheticOnlyAcknowledged: true,
    };
    void this.write(
      `hold:${this.attempt}`,
      payload,
      (key) => this.retention.createHold(this.tenantId(), { ...payload, idempotencyKey: key }),
      (row) => {
        this.holdId = row.id;
        this.holdForm.reset();
      },
    );
  }
  releaseHold() {
    const row = this.selectedHold()?.record;
    if (!row || !this.owner()) return;
    if (this.holdDecision.invalid) {
      this.error.set('invalid');
      return;
    }
    const payload = {
      version: row.version,
      reason: this.holdDecision.controls.reason.value.trim(),
      syntheticOnlyAcknowledged: true as const,
    };
    void this.write(
      `hold-release:${row.id}`,
      payload,
      (key) =>
        this.retention.releaseHold(this.tenantId(), row.id, { ...payload, idempotencyKey: key }),
      () => {},
    );
  }
  createPreview() {
    if (!this.owner() || !this.entry()) return;
    if (this.scenario.invalid) {
      this.error.set('invalid');
      return;
    }
    const payload = {
      entryId: this.entryId(),
      asOf: this.scenario.controls.asOf.value.trim(),
      syntheticOnlyAcknowledged: true as const,
    };
    void this.write(
      `preview:${this.attempt}`,
      payload,
      (key) => this.retention.createPreview(this.tenantId(), { ...payload, idempotencyKey: key }),
      (row) => {
        this.previewId.set(row.id);
        this.scenario.controls.ack.setValue(false);
      },
    );
  }
  async previewPage(first = false) {
    const id = this.previewId(),
      cursor = first ? undefined : this.preview()?.nextCursor;
    if (!id || !this.owner() || this.busy() || this.loading() || (!first && !cursor)) return;
    const tenant = this.tenantId(),
      generation = this.generation;
    this.loading.set(true);
    try {
      const page = await this.value(this.retention.preview(tenant, id, cursor ?? undefined));
      if (tenant === this.tenantId() && generation === this.generation) this.preview.set(page);
    } catch (error) {
      if (tenant === this.tenantId() && generation === this.generation) this.failure(error);
    } finally {
      if (tenant === this.tenantId() && generation === this.generation) this.loading.set(false);
    }
  }
}
