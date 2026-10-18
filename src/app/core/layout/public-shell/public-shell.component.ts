import { toSignal } from '@angular/core/rxjs-interop';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { LanguageToggleComponent } from '../../ui/language-toggle/language-toggle.component';
import { LanguageService } from '../../services/language.service';
import { TextSizeService } from '../../services/text-size.service';

/**
 * Layout for every public (no-login) screen — the data-principal-facing
 * side of Sahmati.
 *
 * Deliberately has *no* nav chrome beyond a contextual back link and the
 * language/text-size toggles (plan §1/§5): a public visitor — often a
 * parent on a low-end phone over 3G, possibly not comfortable reading
 * English — gets a single-column, single-task page, never an app-style
 * nav bar. This component only ever imports from `core/`, never from
 * `features/<authenticated>` (plan §5), so an authenticated-only
 * affordance can never leak onto a public page by accident.
 */
@Component({
  selector: 'app-public-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, LanguageToggleComponent],
  templateUrl: './public-shell.component.html',
  styleUrl: './public-shell.component.scss',
  host: {
    // The public shell wraps every public route's content, so it — not
    // `document.documentElement` — is "the relevant subtree" the GIGW
    // checklist means when it says `lang` must match the active language.
    '[attr.lang]': 'language()',
  },
})
export class PublicShellComponent {
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);
  private readonly textSizeService = inject(TextSizeService);

  readonly language = this.languageService.language;
  readonly textSize = this.textSizeService.size;

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  readonly isHome = computed(() => this.currentUrl() === '/');

  readonly copy = computed(() =>
    this.language() === 'hi'
      ? {
          backToHome: 'वापस होम पर',
          largerText: 'बड़ा टेक्स्ट',
          normalText: 'सामान्य टेक्स्ट',
          skip: 'मुख्य सामग्री पर जाएं',
        }
      : {
          backToHome: 'Back to home',
          largerText: 'Larger text',
          normalText: 'Normal text',
          skip: 'Skip to main content',
        },
  );

  readonly footerTagline = computed(() =>
    this.language() === 'hi'
      ? 'भारतीय स्कूलों और कोचिंग सेंटरों के लिए डेटा संरक्षण अनुपालन।'
      : 'Data protection compliance for Indian schools and coaching centres.',
  );

  readonly footerCopyright = computed(() =>
    this.language() === 'hi'
      ? `© ${new Date().getFullYear()} सहमति`
      : `© ${new Date().getFullYear()} Sahmati`,
  );

  toggleTextSize(): void {
    this.textSizeService.toggle();
  }
}
