import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Centered single-column card shell shared by signup, login and OTP
 * verify — matches the prototype's mobile-first auth screens (brand mark,
 * title, one task). Content projects in; this owns only the chrome.
 */
@Component({
  selector: 'app-auth-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auth-card.component.html',
  styleUrl: './auth-card.component.scss',
})
export class AuthCardComponent {
  readonly eyebrow = input<string>('');
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
}
