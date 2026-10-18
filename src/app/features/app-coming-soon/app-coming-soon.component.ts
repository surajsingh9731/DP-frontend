import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { LanguageService } from '../../core/services/language.service';

/**
 * Honest placeholder for an authenticated module not yet built, rather
 * than a page with fabricated/sample data. `titleEn`/`titleHi` are set
 * per-route via route `data` (see app.routes.ts), the same pattern the
 * public ComingSoonComponent already uses.
 */
@Component({
  selector: 'app-coming-soon-module',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-coming-soon.component.html',
  styleUrl: './app-coming-soon.component.scss',
})
export class AppComingSoonComponent {
  private readonly languageService = inject(LanguageService);
  readonly language = this.languageService.language;

  readonly titleEn = input.required<string>();
  readonly titleHi = input.required<string>();
}
