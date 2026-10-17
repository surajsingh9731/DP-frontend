import {
  createRegisterFields,
  parseRegisterCategories,
} from '../../core/forms/register-fields.form';
import { RegistryReferencesComponent } from '../../core/registry-references/registry-references.component';
import {
  createReferencesForm,
  resetReferences,
} from '../../core/registry-references/registry-references.form';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import type {
  NoticePreview,
  RegisterData,
  RegisterRevision,
  RegisterView,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { I18n } from '../../core/i18n.service';
import { RegisterApi } from '../../core/register-api.service';
import { REGISTER_EN, type RegisterTextKey } from './register.en';
import { REGISTER_HI } from './register.hi';
import { REGISTER_FIELDS, REGISTER_LIMITS } from '../../constants/register.constants';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RegistryReferencesComponent,
    DisplayPreferencesComponent,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly i = inject(I18n);
  readonly api = inject(Api);
  private readonly register = inject(RegisterApi);
  private readonly route = inject(ActivatedRoute);
  readonly tenantId = signal('');
  readonly entries = signal<RegisterView[]>([]);
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly selected = signal<RegisterView | null>(null);
  readonly error = signal<RegisterTextKey | ''>('');
  readonly notice = signal<RegisterTextKey | ''>('');
  readonly revisions = signal<RegisterRevision[]>([]);
  readonly preview = signal<NoticePreview | null>(null);
  readonly detailsBusy = signal(false);
  readonly owner = computed(
    () =>
      this.api.session()?.memberships.find((m) => m.tenantId === this.tenantId())?.role === 'owner',
  );
  readonly references = createReferencesForm();
  readonly form = new FormGroup({
    references: this.references,
    ...createRegisterFields(),
  });
  readonly fields = REGISTER_FIELDS;
  readonly limits = REGISTER_LIMITS;
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.tenantId.set(params.get('tenantId') ?? '');
      this.entries.set([]);
      this.reset();
      this.load();
    });
  }
  t(key: RegisterTextKey): string {
    return this.i.locale() === 'hi' ? REGISTER_HI[key] : REGISTER_EN[key];
  }
  message(key: RegisterTextKey | ''): string {
    return key ? this.t(key) : '';
  }
  load(): void {
    const tenant = this.tenantId();
    this.loading.set(true);
    this.error.set('');
    this.register
      .list(tenant)
      .pipe(
        finalize(() => {
          if (tenant === this.tenantId()) this.loading.set(false);
        }),
      )
      .subscribe({
        next: (rows) => {
          if (tenant === this.tenantId()) this.entries.set(rows);
        },
        error: () => {
          if (tenant === this.tenantId()) {
            this.entries.set([]);
            this.error.set('unavailable');
          }
        },
      });
  }
  reset(): void {
    this.selected.set(null);
    this.revisions.set([]);
    this.preview.set(null);
    this.form.reset();
    resetReferences(this.references);
    this.error.set('');
    this.notice.set('');
  }
  select(entry: RegisterView): void {
    if (this.busy()) return;
    this.selected.set(entry);
    this.revisions.set([]);
    this.preview.set(null);
    this.error.set('');
    this.notice.set('');
    this.form.reset({ ...entry, dataCategories: entry.dataCategories.join(', ') });
    resetReferences(this.references, entry);
  }
  save(): void {
    if (this.busy() || !this.owner()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    const { references, ...raw } = this.form.getRawValue();
    const categories = parseRegisterCategories(raw.dataCategories);
    if (!categories) {
      this.error.set('categoriesError');
      return;
    }
    const data: RegisterData = {
      ...raw,
      ...references,
      dataCategories: categories,
    };
    const entry = this.selected();
    const tenant = this.tenantId();
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    const request = entry
      ? this.register.update(tenant, entry.id, entry.version, data)
      : this.register.create(tenant, data);
    request.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: (saved) => {
        if (tenant !== this.tenantId()) return;
        this.busy.set(false);
        this.select(saved);
        this.entries.update((rows) => [saved, ...rows.filter((row) => row.id !== saved.id)]);
        this.notice.set('saved');
      },
      error: (error: HttpErrorResponse) => {
        this.error.set(error.status === 409 ? 'conflict' : 'failed');
      },
    });
  }
  history(): void {
    const entry = this.selected();
    if (!entry || this.detailsBusy()) return;
    const tenant = this.tenantId();
    this.detailsBusy.set(true);
    this.error.set('');
    this.register
      .history(tenant, entry.id)
      .pipe(finalize(() => this.detailsBusy.set(false)))
      .subscribe({
        next: (rows) => {
          if (tenant === this.tenantId() && entry.id === this.selected()?.id)
            this.revisions.set(rows);
        },
        error: () => this.error.set('failed'),
      });
  }
  showPreview(): void {
    const entry = this.selected();
    if (!entry || this.detailsBusy()) return;
    const tenant = this.tenantId();
    this.detailsBusy.set(true);
    this.preview.set(null);
    this.error.set('');
    this.register
      .preview(tenant, entry.id, this.i.locale())
      .pipe(finalize(() => this.detailsBusy.set(false)))
      .subscribe({
        next: (value) => {
          if (tenant === this.tenantId() && entry.id === this.selected()?.id)
            this.preview.set(value);
        },
        error: () => this.error.set('failed'),
      });
  }
}
