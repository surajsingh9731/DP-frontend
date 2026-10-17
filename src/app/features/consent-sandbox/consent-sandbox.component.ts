import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import type {
  ConsentChoice,
  ConsentOffer,
  ConsentParticipant,
  ConsentReceipt,
  NoticeSnapshotView,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { ConsentApi } from '../../core/consent-api.service';
import { NoticesApi } from '../../core/notices-api.service';
import { I18n } from '../../core/i18n.service';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { StatusBannerComponent } from '../../core/ui/status-banner/status-banner.component';
import { storedActionKey } from '../../core/commands/stored-action-key';
import { CONSENT_KEY_PREFIX, CONSENT_LIMITS } from '../../constants/consent.constants';
import { offerForm, purposeForm, choiceForms } from './consent.forms';
import { CONSENT_EN, type ConsentTextKey } from './consent.en';
import { CONSENT_HI } from './consent.hi';
import { ConsentReceiptComponent } from './consent-receipt.component';
@Component({
  selector: 'app-consent-sandbox',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    DisplayPreferencesComponent,
    ConsentReceiptComponent,
    StatusBannerComponent,
  ],
  templateUrl: './consent-sandbox.component.html',
  styleUrl: './consent-sandbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentSandboxComponent {
  readonly i = inject(I18n);
  private readonly api = inject(Api);
  private readonly consent = inject(ConsentApi);
  private readonly noticesApi = inject(NoticesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  readonly tenantId = signal('');
  readonly offers = signal<ConsentOffer[]>([]);
  readonly notices = signal<NoticeSnapshotView[]>([]);
  readonly history = signal<ConsentReceipt[]>([]);
  readonly participant = signal<ConsentParticipant | null>(null);
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal<ConsentTextKey | ''>('');
  readonly status = signal<ConsentTextKey | ''>('');
  readonly role = computed(
    () => this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role,
  );
  readonly owner = computed(() => this.role() === 'owner');
  readonly canAct = computed(() => this.role() === 'owner' || this.role() === 'staff');
  readonly form = offerForm();
  readonly adultAcknowledged = new FormControl(false, { nonNullable: true });
  readonly choiceAcknowledged = new FormControl(false, { nonNullable: true });
  choices = choiceForms([]);
  readonly limits = CONSENT_LIMITS;
  readonly latest = computed(() => this.participant()?.receipts[0]);
  t(key: ConsentTextKey) {
    return this.i.locale() === 'hi' ? CONSENT_HI[key] : CONSENT_EN[key];
  }
  message(key: ConsentTextKey | '') {
    return key ? this.t(key) : '';
  }
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.participant.set(null);
      this.offers.set([]);
      this.history.set([]);
      this.notices.set([]);
      this.choices = choiceForms([]);
      this.form.reset();
      this.adultAcknowledged.reset();
      this.choiceAcknowledged.reset();
      this.busy.set(false);
      void this.load();
    });
  }
  private async value<T>(request: import('rxjs').Observable<T>): Promise<T> {
    return firstValueFrom(request.pipe(takeUntilDestroyed(this.destroy)));
  }
  async load(): Promise<void> {
    if (this.busy()) return;
    const tenant = this.tenantId();
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await this.value(
        forkJoin({
          offers: this.consent.offers(tenant),
          history: this.consent.ledger(tenant),
          notices: this.noticesApi.list(tenant),
          participant: this.participant()
            ? this.consent.get(tenant, this.participant()!.id)
            : of(null),
        }),
      );
      if (tenant !== this.tenantId()) return;
      this.offers.set(result.offers);
      this.history.set(result.history);
      if (result.participant) this.participant.set(result.participant);
      this.notices.set(
        result.notices.filter((n) => n.status === 'sample_published' && !!n.preparationSource),
      );
    } catch (error) {
      if (tenant === this.tenantId()) {
        this.failure(error);
        if (error instanceof HttpErrorResponse && [403, 404].includes(error.status))
          this.forgetParticipant();
      }
    } finally {
      if (tenant === this.tenantId()) this.loading.set(false);
    }
  }
  addPurpose() {
    if (!this.busy() && this.form.controls.purposes.length < this.limits.purposes)
      this.form.controls.purposes.push(purposeForm());
  }
  removePurpose(index: number) {
    if (!this.busy() && this.form.controls.purposes.length > 1)
      this.form.controls.purposes.removeAt(index);
  }
  private failure(error: unknown) {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    this.error.set(status === 409 ? 'conflict' : status === 403 ? 'expired' : 'failed');
  }
  async create(): Promise<void> {
    if (!this.owner() || this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    const tenant = this.tenantId(),
      value = this.form.getRawValue(),
      payload = {
        noticeId: value.noticeId,
        purposes: value.purposes,
        syntheticOnlyAcknowledged: true as const,
      };
    this.busy.set(true);
    this.error.set('');
    try {
      const key = await storedActionKey(CONSENT_KEY_PREFIX, tenant, 'offer', payload);
      if (tenant !== this.tenantId()) return;
      await this.value(this.consent.create(tenant, { ...payload, idempotencyKey: key }));
      if (tenant === this.tenantId()) {
        this.busy.set(false);
        await this.load();
      }
    } catch (error) {
      if (tenant === this.tenantId()) this.failure(error);
    } finally {
      if (tenant === this.tenantId()) this.busy.set(false);
    }
  }
  async start(offer: ConsentOffer): Promise<void> {
    if (!this.canAct() || this.busy() || this.participant()) return;
    if (!this.adultAcknowledged.value) {
      this.error.set('invalid');
      return;
    }
    const tenant = this.tenantId();
    this.busy.set(true);
    this.error.set('');
    this.status.set('');
    try {
      const participant = await this.value(this.consent.start(tenant, offer.id));
      if (tenant !== this.tenantId()) return;
      this.participant.set(participant);
      this.choices = choiceForms(participant.offer.purposes);
      this.choiceAcknowledged.reset();
    } catch (error) {
      if (tenant === this.tenantId()) this.failure(error);
    } finally {
      if (tenant === this.tenantId()) this.busy.set(false);
    }
  }
  async submit(declineAll = false): Promise<void> {
    const participant = this.participant();
    if (!participant || !this.canAct() || this.busy() || participant.version !== 0) return;
    if (!this.choiceAcknowledged.value) {
      this.error.set('invalid');
      return;
    }
    if (declineAll)
      this.choices.controls.forEach((row) => row.controls.decision.setValue('decline'));
    if (this.choices.invalid) {
      this.choices.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    const payload = {
      offerId: participant.offer.id,
      offerVersion: participant.offer.version,
      catalogHash: participant.offer.catalogHash,
      choices: this.choices.getRawValue() as ConsentChoice[],
      interfaceLanguage: this.i.locale(),
      syntheticOnlyAcknowledged: true as const,
    };
    await this.record('choices', payload, (key) =>
      this.consent.record(this.tenantId(), participant.id, { ...payload, idempotencyKey: key }),
    );
  }
  async withdraw(ids: string[]): Promise<void> {
    const participant = this.participant();
    if (!participant || !this.canAct() || this.busy()) return;
    const payload = {
      version: participant.version,
      purposeIds: ids,
      interfaceLanguage: this.i.locale(),
    };
    await this.record('withdraw', payload, (key) =>
      this.consent.withdraw(this.tenantId(), participant.id, { ...payload, idempotencyKey: key }),
    );
  }
  allowed(): string[] {
    return (
      this.latest()
        ?.choices.filter((c) => c.decision === 'allow')
        .map((c) => c.purposeId) ?? []
    );
  }
  label(id: string): string {
    const purpose = this.participant()?.offer.purposes.find((p) => p.id === id);
    return (this.i.locale() === 'hi' ? purpose?.labelHi : purpose?.labelEn) ?? id;
  }
  private async record(
    action: string,
    payload: object,
    request: (key: string) => import('rxjs').Observable<ConsentReceipt>,
  ): Promise<void> {
    const tenant = this.tenantId(),
      participant = this.participant();
    if (!participant) return;
    this.busy.set(true);
    this.error.set('');
    this.status.set('');
    try {
      const key = await storedActionKey(
        CONSENT_KEY_PREFIX,
        tenant,
        `${action}:${participant.id}`,
        payload,
      );
      if (tenant !== this.tenantId()) return;
      const receipt = await this.value(request(key));
      if (tenant !== this.tenantId()) return;
      this.participant.set({
        ...participant,
        version: receipt.version,
        receipts: [receipt, ...participant.receipts.filter((r) => r.id !== receipt.id)],
      });
      this.history.update((rows) =>
        [receipt, ...rows.filter((r) => r.id !== receipt.id)].slice(0, 50),
      );
      this.status.set('saved');
    } catch (error) {
      if (tenant === this.tenantId()) this.failure(error);
    } finally {
      if (tenant === this.tenantId()) this.busy.set(false);
    }
  }
  private forgetParticipant(): void {
    this.participant.set(null);
    this.choices = choiceForms([]);
    this.adultAcknowledged.reset();
    this.choiceAcknowledged.reset();
    this.status.set('');
  }
  async end(): Promise<void> {
    const participant = this.participant(),
      tenant = this.tenantId();
    if (!participant || this.busy()) return;
    this.busy.set(true);
    try {
      await this.value(this.consent.end(tenant, participant.id));
      if (tenant === this.tenantId()) {
        this.forgetParticipant();
      }
    } catch (error) {
      if (tenant === this.tenantId()) {
        this.failure(error);
        if (error instanceof HttpErrorResponse && [403, 404].includes(error.status))
          this.forgetParticipant();
      }
    } finally {
      if (tenant === this.tenantId()) this.busy.set(false);
    }
  }
}
