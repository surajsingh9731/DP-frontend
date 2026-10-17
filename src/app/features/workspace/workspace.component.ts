import { UiTagDirective } from '../../core/ui/ui-tag.directive';
import { UiCardDirective } from '../../core/ui/ui-card.directive';
import { UiButtonDirective } from '../../core/ui/ui-button.directive';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import type { TaskView, WorkspaceView } from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { I18n, type TextKey } from '../../core/i18n.service';
import { IconComponent } from '../../core/icon.component';
@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [
    UiButtonDirective,
    UiCardDirective,
    UiTagDirective,
    DisplayPreferencesComponent,
    RouterLink,
    IconComponent,
    DatePipe,
  ],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceComponent {
  readonly i = inject(I18n);
  readonly api = inject(Api);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly data = signal<WorkspaceView | null>(null);
  readonly tenantId = signal('');
  readonly loading = signal(true);
  readonly busy = signal(false);
  readonly unavailable = signal(false);
  readonly error = signal<TextKey | ''>('');
  readonly notice = signal<TextKey | ''>('');
  readonly selected = signal<TaskView | null>(null);
  readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('reviewDialog');
  readonly openCount = computed(
    () => this.data()?.tasks.filter((t) => t.status === 'open').length ?? 0,
  );
  readonly noMemberships = computed(() => this.api.session()?.memberships.length === 0);
  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.data.set(null);
      this.tenantId.set(params.get('tenantId') ?? '');
      this.load();
    });
  }
  load(): void {
    if (this.noMemberships()) {
      this.loading.set(false);
      this.unavailable.set(false);
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api
      .summary(this.tenantId())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data) => {
          this.data.set(data);
          this.unavailable.set(false);
        },
        error: () => {
          this.data.set(null);
          this.unavailable.set(true);
        },
      });
  }
  create(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.notice.set('');
    const storageKey = `sahmati.action.${this.tenantId()}`;
    let action = sessionStorage.getItem(storageKey);
    if (!action) {
      action = crypto.randomUUID();
      sessionStorage.setItem(storageKey, action);
    }
    this.api
      .createTask(this.tenantId(), action, this.i.locale())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          sessionStorage.removeItem(storageKey);
          this.notice.set('taskCreated');
          this.load();
        },
        error: () => this.error.set('genericError'),
      });
  }
  review(task: TaskView): void {
    this.selected.set(task);
    this.dialog().nativeElement.showModal();
  }
  cancel(): void {
    this.dialog().nativeElement.close();
    this.selected.set(null);
  }
  confirm(): void {
    const task = this.selected();
    if (!task || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    this.api
      .closeTask(this.tenantId(), task.id, task.version)
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: () => {
          this.cancel();
          this.notice.set('taskClosed');
          this.load();
        },
        error: () => {
          this.cancel();
          this.error.set('genericError');
        },
      });
  }
  logout(): void {
    this.api.logout().subscribe({
      next: () => {
        this.data.set(null);
        void this.router.navigate(['/login']);
      },
      error: () => this.error.set('genericError'),
    });
  }
}
