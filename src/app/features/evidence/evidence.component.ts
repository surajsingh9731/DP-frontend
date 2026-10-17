import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterRenderEffect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest, firstValueFrom, forkJoin, of } from 'rxjs';
import type { EvidencePage, EvidenceDetail, EvidenceFilters } from '@sahmati/contracts';
import { EvidenceApi } from '../../core/evidence-api.service';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { StatusBannerComponent } from '../../core/ui/status-banner/status-banner.component';
import {
  EVIDENCE_KINDS,
  EVIDENCE_PROVENANCE,
  EVIDENCE_PAGE_SIZES,
} from '../../constants/evidence.constants';
import { EvidenceCopy } from './evidence-copy.service';
import type { EvidenceTextKey } from './locales/en';
import { evidenceFiltersForm } from './evidence.forms';
@Component({
  selector: 'app-evidence',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    DisplayPreferencesComponent,
    StatusBannerComponent,
  ],
  templateUrl: './evidence.component.html',
  styleUrl: './evidence.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EvidenceComponent {
  readonly copy = inject(EvidenceCopy);
  private readonly api = inject(EvidenceApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroy = inject(DestroyRef);
  private readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('eventHeading');
  private generation = 0;
  private selection: { kind: string; id: string; version: number } | null = null;
  readonly tenantId = signal('');
  readonly page = signal<EvidencePage | null>(null);
  readonly detail = signal<EvidenceDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal<EvidenceTextKey | ''>('');
  readonly filters = signal<EvidenceFilters>({ limit: 20 });
  readonly form = evidenceFiltersForm();
  readonly kinds = EVIDENCE_KINDS;
  readonly provenance = EVIDENCE_PROVENANCE;
  readonly sizes = EVIDENCE_PAGE_SIZES;
  constructor() {
    afterRenderEffect(() => {
      if (this.detail()) this.heading()?.nativeElement.focus();
    });
    combineLatest([this.route.paramMap, this.route.queryParamMap])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, query]) => {
        this.tenantId.set(params.get('tenantId') ?? '');
        this.selection = params.get('kind')
          ? {
              kind: params.get('kind')!,
              id: params.get('id') ?? '',
              version: Number(params.get('version')),
            }
          : null;
        const filters: EvidenceFilters = {
          limit: query.has('limit') ? Number(query.get('limit')) : 20,
          ...(query.get('kind') ? { kind: query.get('kind') as EvidenceFilters['kind'] } : {}),
          ...(query.get('provenance')
            ? { provenance: query.get('provenance') as EvidenceFilters['provenance'] }
            : {}),
          ...(query.get('q') ? { q: query.get('q')! } : {}),
          ...(query.get('cursor') ? { cursor: query.get('cursor')! } : {}),
        };
        this.filters.set(filters);
        this.form.setValue({
          q: filters.q ?? '',
          kind: filters.kind ?? '',
          provenance: filters.provenance ?? '',
          limit: filters.limit ?? 20,
        });
        this.page.set(null);
        this.detail.set(null);
        void this.load();
      });
  }
  async load(): Promise<void> {
    const tenant = this.tenantId(),
      selection = this.selection,
      generation = ++this.generation;
    this.loading.set(true);
    this.error.set('');
    try {
      const result = await firstValueFrom(
        forkJoin({
          page: this.api.list(tenant, this.filters()),
          detail: selection
            ? this.api.detail(tenant, selection.kind, selection.id, selection.version)
            : of(null),
        }).pipe(takeUntilDestroyed(this.destroy)),
      );
      if (generation !== this.generation || tenant !== this.tenantId()) return;
      this.page.set(result.page);
      this.detail.set(result.detail);
    } catch (error) {
      if (generation !== this.generation || tenant !== this.tenantId()) return;
      this.page.set(null);
      this.detail.set(null);
      const code = error instanceof HttpErrorResponse ? error.status : 0;
      this.error.set(
        code === 400
          ? 'invalid'
          : code === 403
            ? 'forbidden'
            : code === 404
              ? 'unavailable'
              : 'failed',
      );
    } finally {
      if (generation === this.generation && tenant === this.tenantId()) this.loading.set(false);
    }
  }
  apply(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('invalid');
      return;
    }
    const value = this.form.getRawValue();
    void this.router.navigate(['/workspace', this.tenantId(), 'evidence'], {
      queryParams: {
        ...(value.q.trim() ? { q: value.q.trim() } : {}),
        ...(value.kind ? { kind: value.kind } : {}),
        ...(value.provenance ? { provenance: value.provenance } : {}),
        limit: value.limit,
      },
    });
  }
  reset(): void {
    void this.router.navigate(['/workspace', this.tenantId(), 'evidence'], {
      queryParams: { limit: 20 },
    });
  }
  next(): void {
    const cursor = this.page()?.nextCursor;
    if (!cursor || this.loading()) return;
    void this.router.navigate(['/workspace', this.tenantId(), 'evidence'], {
      queryParams: { ...this.filters(), cursor },
    });
  }
}
