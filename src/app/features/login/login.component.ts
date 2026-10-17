import { UiTagDirective } from '../../core/ui/ui-tag.directive';
import { UiButtonDirective } from '../../core/ui/ui-button.directive';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import {
  DEMO_ACCOUNTS,
  DEMO_EMAIL_DOMAIN,
  EMPTY_WORKSPACE_ID,
} from '../../constants/demo.constants';
import { LOGIN_STORAGE, LOGIN_CODE_PATTERN } from '../../constants/login.constants';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize, switchMap } from 'rxjs';
import { Api } from '../../core/api.service';
import { I18n, type TextKey } from '../../core/i18n.service';
import { IconComponent } from '../../core/icon.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    UiButtonDirective,
    UiTagDirective,
    DisplayPreferencesComponent,
    ReactiveFormsModule,
    RouterLink,
    IconComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly i = inject(I18n);
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  readonly busy = signal(false);
  readonly error = signal<TextKey | ''>('');
  readonly stage = signal(sessionStorage.getItem(LOGIN_STORAGE.challenge) ? 'code' : 'email');
  readonly email = new FormControl(
    sessionStorage.getItem(LOGIN_STORAGE.email) ?? 'owner@demo.sahmati.test',
    { nonNullable: true, validators: [Validators.required, Validators.email] },
  );
  readonly code = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(LOGIN_CODE_PATTERN)],
  });
  readonly accounts = DEMO_ACCOUNTS;
  choose(account: string): void {
    this.email.setValue(`${account}@${DEMO_EMAIL_DOMAIN}`);
    this.error.set('');
  }
  request(): void {
    if (this.busy()) return;
    if (this.email.invalid) {
      this.email.markAsTouched();
      this.error.set('invalidEmail');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.api
      .challenge(this.email.value, this.i.locale())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: (result) => {
          sessionStorage.setItem(LOGIN_STORAGE.challenge, result.challengeId);
          sessionStorage.setItem(LOGIN_STORAGE.email, this.email.value);
          this.stage.set('code');
        },
        error: () => this.error.set('genericError'),
      });
  }
  verify(): void {
    if (this.busy()) return;
    if (this.code.invalid) {
      this.code.markAsTouched();
      this.error.set('invalidCode');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    this.api
      .verify(sessionStorage.getItem(LOGIN_STORAGE.challenge) ?? '', this.code.value)
      .pipe(
        switchMap(() => this.api.me()),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: (session) => {
          sessionStorage.removeItem(LOGIN_STORAGE.challenge);
          this.code.reset();
          void this.router.navigate(
            session.memberships[0]
              ? ['/workspace', session.memberships[0].tenantId]
              : ['/workspace', EMPTY_WORKSPACE_ID],
          );
        },
        error: () => this.error.set('authError'),
      });
  }
  reset(): void {
    sessionStorage.removeItem(LOGIN_STORAGE.challenge);
    this.stage.set('email');
    this.code.reset();
    this.error.set('');
  }
}
