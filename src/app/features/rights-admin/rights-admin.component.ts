import { DatePipe } from '@angular/common';
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
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin, of, type Observable } from 'rxjs';
import type {
  RightsSummary,
  RightsDetail,
  RightsActionInput,
  FollowupAssignee,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { RightsApi } from '../../core/rights-api.service';
import { FollowupsApi } from '../../core/followups-api.service';
import { RightsCopy } from '../../core/rights/rights-copy.service';
import type { RightsTextKey } from '../../core/rights/rights.en';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { storedActionKey } from '../../core/commands/stored-action-key';
import { syntheticEvidenceReferences } from '../../core/forms/synthetic-evidence';
import {
  RIGHTS_ITEM_ACTIONS,
  RIGHTS_KEY_PREFIX,
  RIGHTS_LIMITS,
} from '../../constants/rights.constants';
import { rightsActionForm, rightsActions } from './rights-admin.forms';
@Component({
  selector: 'app-rights-admin',
  imports: [DatePipe, ReactiveFormsModule, RouterLink, DisplayPreferencesComponent],
  templateUrl: './rights-admin.component.html',
  styleUrl: './rights-admin.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightsAdminComponent {
  readonly copy = inject(RightsCopy);
  private readonly api = inject(Api);
  private readonly rights = inject(RightsApi);
  private readonly followups = inject(FollowupsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('requestHeading');
  private generation = 0;
  readonly tenantId = signal('');
  readonly requests = signal<RightsSummary[]>([]);
  readonly selected = signal<RightsDetail | null>(null);
  readonly assignees = signal<FollowupAssignee[]>([]);
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal<RightsTextKey | ''>('');
  readonly status = signal<RightsTextKey | ''>('');
  readonly form = rightsActionForm();
  readonly limits = RIGHTS_LIMITS;
  readonly owner = computed(() => this.role() === 'owner');
  readonly canTriage = computed(() => this.owner() || this.role() === 'staff');
  readonly actions = computed(() =>
    this.selected() && this.canTriage() ? rightsActions(this.selected()!.status, this.owner()) : [],
  );
  private role() {
    return this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role;
  }
  itemAction() {
    return RIGHTS_ITEM_ACTIONS.some((action) => action === this.form.controls.action.value);
  }
  unresolved() {
    return (
      this.selected()?.workItems.filter((item) => item.status !== 'independently_reviewed')
        .length ?? 0
    );
  }
  constructor() {
    afterRenderEffect(() => {
      if (this.selected()) this.heading()?.nativeElement.focus();
    });
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.requests.set([]);
      this.selected.set(null);
      this.assignees.set([]);
      this.busy.set(false);
      this.form.reset();
      this.status.set('');
      void this.load(params.get('requestId') ?? undefined);
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
          : code === 404
            ? 'unavailable'
            : code === 400
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
      const data = await this.value(
        forkJoin({
          requests: this.rights.list(tenant),
          assignees: this.owner() ? this.followups.assignees(tenant) : of([]),
          detail: id ? this.rights.get(tenant, id) : of(null),
        }),
      );
      if (tenant !== this.tenantId() || generation !== this.generation) return;
      this.requests.set(data.requests);
      this.assignees.set(data.assignees);
      this.selected.set(data.detail);
      this.form.reset();
      this.form.controls.action.setValue(this.actions()[0] ?? 'begin_review');
      this.form.controls.assigneeId.setValue(data.detail?.assignee?.id ?? '');
      this.form.controls.responseLanguage.setValue(this.copy.i.locale());
    } catch (error) {
      if (tenant === this.tenantId() && generation === this.generation) {
        this.requests.set([]);
        this.selected.set(null);
        this.failure(error);
      }
    } finally {
      if (tenant === this.tenantId() && generation === this.generation) this.loading.set(false);
    }
  }
  async act(): Promise<void> {
    const request = this.selected();
    if (!request || !this.canTriage() || this.busy() || this.loading()) return;
    const value = this.form.getRawValue(),
      refs = syntheticEvidenceReferences(value.references);
    if (
      this.form.invalid ||
      !refs ||
      !this.actions().includes(value.action) ||
      (this.itemAction() && !value.workItemId) ||
      (value.action === 'respond' && (!value.responseText.trim() || !value.responseAck)) ||
      (value.action === 'close' && this.unresolved() > 0 && !value.closeAck)
    ) {
      this.form.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    const payload: Omit<RightsActionInput, 'idempotencyKey'> = {
      version: request.version,
      action: value.action,
      note: value.note.trim(),
      evidenceRefs: refs,
      ...(value.action === 'assign' ? { assigneeId: value.assigneeId || null } : {}),
      ...(this.itemAction() ? { workItemId: value.workItemId } : {}),
      ...(value.action === 'respond'
        ? {
            response: {
              language: value.responseLanguage,
              text: value.responseText.trim(),
              resolution: value.resolution,
              reviewedResponseAcknowledged: true as const,
            },
          }
        : {}),
      ...(value.action === 'close' ? { unresolvedAcknowledged: value.closeAck } : {}),
      syntheticOnlyAcknowledged: true,
    };
    const tenant = this.tenantId(),
      current = () => tenant === this.tenantId() && this.selected()?.id === request.id;
    this.busy.set(true);
    this.error.set('');
    this.status.set('');
    try {
      const key = await storedActionKey(RIGHTS_KEY_PREFIX, tenant, `triage:${request.id}`, payload);
      if (!current()) return;
      await this.value(this.rights.action(tenant, request.id, { ...payload, idempotencyKey: key }));
      if (!current()) return;
      this.busy.set(false);
      await this.load(request.id);
      if (current() && !this.error()) this.status.set('saved');
    } catch (error) {
      if (current()) this.failure(error);
    } finally {
      if (current()) this.busy.set(false);
    }
  }
}
