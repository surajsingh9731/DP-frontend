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
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin, of, interval, type Observable } from 'rxjs';
import type {
  CheckDetail,
  CheckResult,
  FollowupTask,
  ReviewEvidenceInput,
  ResolveLocationInput,
  CheckEvaluation,
  TaskEvidenceReview,
  MappingResult,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { ChecksApi } from '../../core/checks-api.service';
import { FollowupsApi } from '../../core/followups-api.service';
import { I18n } from '../../core/i18n.service';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { storedActionKey } from '../../core/commands/stored-action-key';
import { syntheticEvidenceReferences } from '../../core/forms/synthetic-evidence';
import {
  CHECK_KEY_PREFIX,
  CHECK_LIMITS,
  CHECK_RESULTS,
  CHECK_MAPPING_KINDS,
} from '../../constants/checks.constants';
import { evidenceReviewForm, locationReviewForm } from './checks.forms';
import { CHECKS_EN, CHECK_REASONS_EN, type ChecksTextKey } from './checks.en';
import { CHECKS_HI, CHECK_REASONS_HI } from './checks.hi';
@Component({
  selector: 'app-checks',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, DisplayPreferencesComponent],
  templateUrl: './checks.component.html',
  styleUrl: './checks.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecksComponent {
  readonly i = inject(I18n);
  private readonly api = inject(Api);
  private readonly checks = inject(ChecksApi);
  private readonly followups = inject(FollowupsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('checkHeading');
  private generation = 0;
  private receivedAt = 0;
  private serverAt = 0;
  private evaluationAttempt = crypto.randomUUID();
  readonly tenantId = signal('');
  readonly tasks = signal<FollowupTask[]>([]);
  readonly detail = signal<CheckDetail | null>(null);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly error = signal<ChecksTextKey | ''>('');
  readonly status = signal<ChecksTextKey | ''>('');
  readonly tick = signal(0);
  readonly owner = computed(() => this.role() === 'owner');
  readonly canEvaluate = computed(() => this.role() === 'owner' || this.role() === 'staff');
  readonly review = evidenceReviewForm();
  readonly mapping = locationReviewForm();
  readonly limits = CHECK_LIMITS;
  readonly results = CHECK_RESULTS;
  readonly kinds = CHECK_MAPPING_KINDS;
  readonly latest = computed(() => this.detail()?.evaluations[0]);
  readonly freshness = computed(() => {
    this.tick();
    const data = this.detail(),
      review = data?.reviews[0];
    if (!data) return 'missing' as const;
    if (data.freshness !== 'current') return data.freshness;
    return review &&
      Date.parse(review.validUntil) <= this.serverAt + performance.now() - this.receivedAt
      ? ('expired' as const)
      : ('current' as const);
  });
  readonly current = computed(() => {
    const data = this.detail();
    return (
      !!data?.latestEvaluationCurrent &&
      this.latest()?.checks.find((check) => check.id === 'manual_assessment')?.freshness ===
        this.freshness()
    );
  });
  private role() {
    return this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role;
  }
  t(key: ChecksTextKey) {
    return this.i.locale() === 'hi' ? CHECKS_HI[key] : CHECKS_EN[key];
  }
  message(key: ChecksTextKey | '') {
    return key ? this.t(key) : '';
  }
  reason(code: string) {
    return (
      (this.i.locale() === 'hi' ? CHECK_REASONS_HI : CHECK_REASONS_EN)[code] ?? this.t('unknown')
    );
  }
  location(task: FollowupTask): string {
    return task.location.kind === 'unmapped'
      ? this.t(task.location.name === 'paper' ? 'unmappedPaper' : 'unmappedOther')
      : task.location.name;
  }
  shownResult(result: CheckResult): CheckResult {
    return this.current() ? result : 'unknown';
  }
  constructor() {
    afterRenderEffect(() => {
      if (this.detail()) this.heading()?.nativeElement.focus();
    });
    interval(1000)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.tick.update((value) => value + 1));
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.tasks.set([]);
      this.detail.set(null);
      this.status.set('');
      this.error.set('');
      this.review.reset();
      this.mapping.reset();
      this.busy.set(false);
      void this.load(params.get('taskId') ?? undefined);
    });
  }
  private value<T>(request: Observable<T>) {
    return firstValueFrom(request.pipe(takeUntilDestroyed(this.destroy)));
  }
  private failure(error: unknown) {
    const code = error instanceof HttpErrorResponse ? error.status : 0;
    this.error.set(
      code === 409
        ? 'conflict'
        : code === 403
          ? 'forbidden'
          : code === 400
            ? 'invalid'
            : code === 404
              ? 'unavailable'
              : 'failed',
    );
  }
  async load(id = this.detail()?.task.id): Promise<void> {
    if (this.busy()) return;
    const tenant = this.tenantId(),
      generation = ++this.generation;
    this.loading.set(true);
    this.error.set('');
    try {
      const data = await this.value(
        forkJoin({
          tasks: this.followups.list(tenant),
          detail: id ? this.checks.get(tenant, id) : of(null),
        }),
      );
      if (tenant !== this.tenantId() || generation !== this.generation) return;
      this.tasks.set(data.tasks);
      this.serverAt = data.detail ? Date.parse(data.detail.serverTime) : 0;
      this.receivedAt = performance.now();
      this.detail.set(data.detail);
      this.review.reset();
      this.review.controls.validForMinutes.setValue(60);
      this.mapping.reset();
      this.mapping.controls.kind.setValue(
        data.detail?.task.location.name === 'paper' ? 'paper' : 'digital',
      );
    } catch (error) {
      if (tenant === this.tenantId() && generation === this.generation) {
        this.detail.set(null);
        this.failure(error);
      }
    } finally {
      if (tenant === this.tenantId() && generation === this.generation) this.loading.set(false);
    }
  }
  async evaluate(): Promise<void> {
    const data = this.detail();
    if (!data || !this.canEvaluate() || this.busy() || this.loading()) return;
    const payload = {
      taskVersion: data.task.version,
      reviewVersion: data.reviews[0]?.version ?? 0,
    };
    const tenant = this.tenantId();
    await this.mutate(
      `evaluate:${this.evaluationAttempt}`,
      payload,
      (key) => this.checks.evaluate(tenant, data.task.id, { ...payload, idempotencyKey: key }),
      () => {
        this.evaluationAttempt = crypto.randomUUID();
      },
    );
  }
  async saveReview(): Promise<void> {
    const data = this.detail();
    if (!data || !this.owner() || this.busy() || this.loading()) return;
    const value = this.review.getRawValue(),
      refs = syntheticEvidenceReferences(value.references);
    if (this.review.invalid || !refs?.length) {
      this.error.set('invalid');
      return;
    }
    const payload: Omit<ReviewEvidenceInput, 'idempotencyKey'> = {
      taskVersion: data.task.version,
      reviewVersion: data.reviews[0]?.version ?? 0,
      applicability: value.applicability,
      result: value.result,
      rationale: value.rationale.trim(),
      evidenceRefs: refs,
      validForMinutes: value.validForMinutes,
      syntheticOnlyAcknowledged: true,
    };
    const tenant = this.tenantId();
    await this.mutate('review', payload, (key) =>
      this.checks.review(tenant, data.task.id, { ...payload, idempotencyKey: key }),
    );
  }
  async saveMapping(): Promise<void> {
    const data = this.detail();
    if (
      !data ||
      !this.owner() ||
      this.busy() ||
      this.loading() ||
      data.task.location.mapping !== 'unknown'
    )
      return;
    const value = this.mapping.getRawValue(),
      refs = syntheticEvidenceReferences(value.references);
    if (this.mapping.invalid || !refs?.length) {
      this.error.set('invalid');
      return;
    }
    const payload: Omit<ResolveLocationInput, 'idempotencyKey'> = {
      taskVersion: data.task.version,
      kind: value.kind,
      name: value.name.trim(),
      detail: value.detail.trim(),
      rationale: value.rationale.trim(),
      evidenceRefs: refs,
      syntheticOnlyAcknowledged: true,
    };
    const tenant = this.tenantId();
    await this.mutate('mapping', payload, (key) =>
      this.checks.map(tenant, data.task.id, { ...payload, idempotencyKey: key }),
    );
  }
  private async mutate(
    action: string,
    payload: object,
    request: (key: string) => Observable<CheckEvaluation | TaskEvidenceReview | MappingResult>,
    committed?: () => void,
  ): Promise<void> {
    const tenant = this.tenantId(),
      id = this.detail()?.task.id;
    if (!id) return;
    this.busy.set(true);
    this.error.set('');
    this.status.set('');
    try {
      const key = await storedActionKey(CHECK_KEY_PREFIX, tenant, `${action}:${id}`, payload);
      if (tenant !== this.tenantId()) return;
      await this.value(request(key));
      if (tenant !== this.tenantId()) return;
      committed?.();
      this.busy.set(false);
      await this.load(id);
      if (!this.error() && tenant === this.tenantId()) this.status.set('saved');
    } catch (error) {
      if (tenant === this.tenantId()) this.failure(error);
    } finally {
      if (tenant === this.tenantId()) this.busy.set(false);
    }
  }
}
