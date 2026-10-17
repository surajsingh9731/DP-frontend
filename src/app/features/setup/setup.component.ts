import {
  createRegisterFields,
  parseRegisterCategories,
} from '../../core/forms/register-fields.form';
import { requiredTextControl } from '../../core/forms/required-text-control';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import type { RegisterData, SectorPackView, SetupView } from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { I18n } from '../../core/i18n.service';
import { SetupApi } from '../../core/setup-api.service';
import { REGISTER_FIELDS, REGISTER_LIMITS } from '../../constants/register.constants';
import {
  SETUP_COMPLETION_STORAGE_PREFIX,
  SETUP_LIMITS,
  SETUP_STEPS,
} from '../../constants/setup.constants';
import { SETUP_EN, type SetupTextKey } from './setup.en';
import { SETUP_HI } from './setup.hi';

@Component({
  selector: 'app-setup',
  standalone: true,
  imports: [DisplayPreferencesComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './setup.component.html',
  styleUrl: './setup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupComponent {
  readonly i = inject(I18n);
  readonly api = inject(Api);
  private readonly setupApi = inject(SetupApi);
  private readonly route = inject(ActivatedRoute);
  readonly tenantId = signal('');
  readonly setup = signal<SetupView | null>(null);
  readonly packs = signal<SectorPackView[]>([]);
  readonly step = signal<1 | 2 | 3>(1);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly error = signal<SetupTextKey | ''>('');
  readonly notice = signal<SetupTextKey | ''>('');
  readonly role = computed(
    () => this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role,
  );
  readonly owner = computed(() => this.role() === 'owner');
  readonly canEdit = computed(
    () =>
      this.setup()?.status !== 'completed' &&
      (this.owner() || (this.role() === 'staff' && !!this.setup())),
  );
  readonly fields = REGISTER_FIELDS;
  readonly limits = REGISTER_LIMITS;
  readonly setupLimits = SETUP_LIMITS;
  readonly steps = SETUP_STEPS;
  readonly organisation = new FormGroup({
    organisationName: requiredTextControl(SETUP_LIMITS.organisationName),
    packId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly form = new FormGroup({
    ...createRegisterFields(),
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.setup.set(null);
      this.packs.set([]);
      this.form.reset();
      this.organisation.reset();
      this.load();
    });
  }
  t(key: SetupTextKey): string {
    return this.i.locale() === 'hi' ? SETUP_HI[key] : SETUP_EN[key];
  }
  message(key: SetupTextKey | ''): string {
    return key ? this.t(key) : '';
  }
  stepLabel(step: 1 | 2 | 3): string {
    return this.t(step === 1 ? 'step1' : step === 2 ? 'step2' : 'step3');
  }
  packName(pack: SectorPackView): string {
    return this.i.locale() === 'hi' ? pack.nameHi : pack.nameEn;
  }
  selectedPack(): SectorPackView | undefined {
    return this.packs().find((pack) => pack.id === this.organisation.controls.packId.value);
  }
  load(): void {
    if (this.busy()) return;
    const tenant = this.tenantId();
    this.loading.set(true);
    this.error.set('');
    this.notice.set('');
    this.setupApi.get(tenant).subscribe({
      next: (value) => {
        if (tenant !== this.tenantId()) return;
        this.packs.set(value.packs);
        this.setup.set(value.setup);
        if (value.setup) this.adopt(value.setup);
        else {
          this.step.set(1);
          this.organisation.reset();
          this.form.reset();
        }
        this.loading.set(false);
      },
      error: () => {
        if (tenant !== this.tenantId()) return;
        this.setup.set(null);
        this.packs.set([]);
        this.error.set('unavailable');
        this.loading.set(false);
      },
    });
  }
  private adopt(saved: SetupView): void {
    this.setup.set(saved);
    this.step.set(saved.step);
    this.organisation.reset({ organisationName: saved.organisationName, packId: saved.packId });
    const draft =
      saved.draft ??
      this.packs().find((pack) => pack.id === saved.packId && pack.version === saved.packVersion)
        ?.defaults;
    if (draft) this.form.reset({ ...draft, dataCategories: draft.dataCategories.join(', ') });
    else this.form.reset();
    if (saved.status === 'completed') sessionStorage.removeItem(this.completionStorageKey());
  }
  private completionStorageKey(): string {
    const membership = this.api
      .session()
      ?.memberships.find((value) => value.tenantId === this.tenantId());
    return `${SETUP_COMPLETION_STORAGE_PREFIX}:${this.tenantId()}:${encodeURIComponent(membership?.branch ?? '')}`;
  }
  private completionToken(saved: SetupView): string {
    const storageKey = this.completionStorageKey();
    const identity = `${saved.version}:${saved.updatedAt}:${saved.packId}:${saved.packVersion}`;
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        const value = JSON.parse(stored) as { identity?: string; key?: string };
        if (value.identity === identity && typeof value.key === 'string') return value.key;
      } catch {
        /* An invalid local cache is replaced; no server state changes here. */
      }
    }
    const key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, JSON.stringify({ identity, key }));
    return key;
  }
  previous(): void {
    if (!this.busy() && this.step() > 1) this.step.set(this.step() === 3 ? 2 : 1);
  }
  showReview(): void {
    if (this.busy() || !this.setup()?.draft) return;
    if (this.form.dirty || this.organisation.dirty) {
      this.error.set('unsaved');
      return;
    }
    this.step.set(3);
  }
  save(nextStep: 1 | 2 | 3 = this.step()): void {
    if (this.busy() || this.loading() || !this.canEdit()) return;
    const pack = this.selectedPack();
    if (this.organisation.invalid || !pack?.available) {
      this.organisation.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    let draft: RegisterData | null = this.setup()?.draft ?? null;
    if (nextStep >= 2 && !draft && !this.form.dirty && pack.defaults) {
      this.form.reset({
        ...pack.defaults,
        dataCategories: pack.defaults.dataCategories.join(', '),
      });
    }
    if (nextStep >= 2 || this.step() >= 2 || this.form.dirty) {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        this.error.set('invalid');
        return;
      }
      const raw = this.form.getRawValue();
      const categories = parseRegisterCategories(raw.dataCategories);
      if (!categories) {
        this.error.set('categoriesError');
        return;
      }
      draft = { ...raw, dataCategories: categories };
    }
    const tenant = this.tenantId();
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.setupApi
      .save(tenant, {
        version: this.setup()?.version ?? 0,
        ...this.organisation.getRawValue(),
        packVersion: pack.version,
        step: nextStep,
        draft,
      })
      .subscribe({
        next: (saved) => {
          if (tenant !== this.tenantId()) return;
          this.busy.set(false);
          this.adopt(saved);
          this.notice.set('saved');
        },
        error: (error: HttpErrorResponse) => {
          if (tenant !== this.tenantId()) return;
          this.busy.set(false);
          this.error.set(error.status === 409 ? 'conflict' : 'failed');
        },
      });
  }
  complete(): void {
    const saved = this.setup();
    if (!this.owner() || this.busy() || !saved?.draft || saved.status === 'completed') return;
    if (this.form.dirty || this.organisation.dirty) {
      this.error.set('unsaved');
      return;
    }
    const tenant = this.tenantId();
    const completionKey = this.completionToken(saved);
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    this.setupApi.complete(tenant, saved.version, completionKey).subscribe({
      next: (result) => {
        if (tenant !== this.tenantId()) return;
        this.busy.set(false);
        this.adopt(result);
      },
      error: (error: HttpErrorResponse) => {
        if (tenant !== this.tenantId()) return;
        this.busy.set(false);
        this.error.set(error.status === 409 ? 'conflict' : 'failed');
      },
    });
  }
}
