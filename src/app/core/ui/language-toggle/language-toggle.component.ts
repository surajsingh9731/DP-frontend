import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppLanguage, LanguageService } from '../../services/language.service';

/**
 * Shared EN/HI language toggle (core primitive — reused by the public shell
 * now, and by the authenticated shell later per the plan's §3 primitive
 * set). Persists the viewer's choice via `LanguageService` and exposes the
 * current selection as `aria-pressed` on each option rather than color
 * alone, so the active language is announced to screen readers too.
 */
@Component({
  selector: 'app-language-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './language-toggle.component.html',
  styleUrl: './language-toggle.component.scss',
})
export class LanguageToggleComponent {
  private readonly languageService = inject(LanguageService);

  readonly language = this.languageService.language;

  select(lang: AppLanguage): void {
    this.languageService.setLanguage(lang);
  }
}
