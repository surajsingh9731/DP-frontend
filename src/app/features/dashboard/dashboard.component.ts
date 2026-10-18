import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DashboardApiService } from '../../core/api/dashboard-api.service';
import { LanguageService } from '../../core/services/language.service';
import { IconComponent, type IconName } from '../../core/ui/icon/icon.component';
import { catchError, of } from 'rxjs';

const STATUS_ICON: Record<string, IconName> = {
  ok: 'check',
  warning: 'warning',
  danger: 'danger',
};

/** Home screen — every tile reads live from `/dashboard/readiness`, computed fresh from the other modules' own tables (never cached, never a mock number). */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly dashboardApi = inject(DashboardApiService);
  readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly checks = toSignal(this.dashboardApi.readiness().pipe(catchError(() => of(null))), {
    initialValue: undefined,
  });

  readonly statusIcon = STATUS_ICON;

  readonly readinessPercent = computed(() => {
    const checks = this.checks();
    if (!checks || checks.length === 0) return 0;
    const ok = checks.filter((check) => check.status === 'ok').length;
    return Math.round((ok / checks.length) * 100);
  });

  readonly stepsLeft = computed(() => {
    const checks = this.checks();
    if (!checks) return 0;
    return checks.filter((check) => check.status !== 'ok').length;
  });

  readonly ringGradient = computed(() => {
    const percent = this.readinessPercent();
    return `conic-gradient(var(--color-primary-700) ${percent * 3.6}deg, var(--color-border) 0deg)`;
  });
}
