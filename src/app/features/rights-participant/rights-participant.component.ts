import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import type { ParticipantRightsView, SubmitRightsInput } from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { RightsApi } from '../../core/rights-api.service';
import { RightsCopy } from '../../core/rights/rights-copy.service';
import type { RightsTextKey } from '../../core/rights/rights.en';
import { RightsPublicCardComponent } from '../../core/rights/rights-public-card.component';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { storedActionKey } from '../../core/commands/stored-action-key';
import { RIGHTS_KEY_PREFIX, RIGHTS_KINDS, RIGHTS_LIMITS } from '../../constants/rights.constants';
import { participantRightsForm } from './rights-participant.forms';
@Component({
  selector: 'app-rights-participant',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    DisplayPreferencesComponent,
    RightsPublicCardComponent,
  ],
  templateUrl: './rights-participant.component.html',
  styleUrl: './rights-participant.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightsParticipantComponent {
  readonly copy = inject(RightsCopy);
  private readonly api = inject(Api);
  private readonly rights = inject(RightsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private generation = 0;
  private attempt = crypto.randomUUID();
  readonly tenantId = signal('');
  readonly sessionId = signal('');
  readonly data = signal<ParticipantRightsView | null>(null);
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal<RightsTextKey | ''>('');
  readonly status = signal<RightsTextKey | ''>('');
  readonly form = participantRightsForm();
  readonly kinds = RIGHTS_KINDS;
  readonly limits = RIGHTS_LIMITS;
  readonly canSubmit = computed(() =>
    ['owner', 'staff'].includes(
      this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role ?? '',
    ),
  );
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.sessionId.set(params.get('sessionId') ?? '');
      this.data.set(null);
      this.busy.set(false);
      this.form.reset();
      this.status.set('');
      void this.load();
    });
  }
  private value<T>(request: import('rxjs').Observable<T>) {
    return firstValueFrom(request.pipe(takeUntilDestroyed(this.destroy)));
  }
  private failure(error: unknown) {
    const code = error instanceof HttpErrorResponse ? error.status : 0;
    this.error.set(
      [401, 403, 404].includes(code)
        ? 'expired'
        : code === 409
          ? 'conflict'
          : code === 400
            ? 'invalid'
            : 'failed',
    );
    if ([401, 403, 404].includes(code)) this.data.set(null);
  }
  async load(): Promise<void> {
    if (this.busy()) return;
    const tenant = this.tenantId(),
      session = this.sessionId(),
      generation = ++this.generation;
    this.loading.set(true);
    this.error.set('');
    try {
      const data = await this.value(this.rights.own(tenant, session));
      if (
        tenant === this.tenantId() &&
        session === this.sessionId() &&
        generation === this.generation
      )
        this.data.set(data);
    } catch (error) {
      if (
        tenant === this.tenantId() &&
        session === this.sessionId() &&
        generation === this.generation
      )
        this.failure(error);
    } finally {
      if (
        tenant === this.tenantId() &&
        session === this.sessionId() &&
        generation === this.generation
      )
        this.loading.set(false);
    }
  }
  async submit(): Promise<void> {
    if (!this.data() || !this.canSubmit() || this.busy() || this.loading()) return;
    const value = this.form.getRawValue();
    if (
      this.form.invalid ||
      (value.kind === 'correction' &&
        (!value.fieldReference.trim() || !value.requestedValue.trim()))
    ) {
      this.form.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    const tenant = this.tenantId(),
      session = this.sessionId(),
      payload: Omit<SubmitRightsInput, 'idempotencyKey'> = {
        kind: value.kind,
        inputLanguage: this.copy.i.locale(),
        details: value.details.trim(),
        ...(value.kind === 'correction'
          ? {
              correction: {
                fieldReference: value.fieldReference.trim(),
                requestedValue: value.requestedValue.trim(),
              },
            }
          : {}),
        syntheticOnlyAcknowledged: true,
      };
    this.busy.set(true);
    this.error.set('');
    this.status.set('');
    try {
      const key = await storedActionKey(
        RIGHTS_KEY_PREFIX,
        tenant,
        `participant:${session}:${this.attempt}`,
        payload,
      );
      if (tenant !== this.tenantId() || session !== this.sessionId()) return;
      await this.value(this.rights.submit(tenant, session, { ...payload, idempotencyKey: key }));
      if (tenant !== this.tenantId() || session !== this.sessionId()) return;
      this.attempt = crypto.randomUUID();
      this.form.reset();
      this.busy.set(false);
      await this.load();
      if (!this.error()) this.status.set('saved');
    } catch (error) {
      if (tenant === this.tenantId() && session === this.sessionId()) this.failure(error);
    } finally {
      if (tenant === this.tenantId() && session === this.sessionId()) this.busy.set(false);
    }
  }
}
