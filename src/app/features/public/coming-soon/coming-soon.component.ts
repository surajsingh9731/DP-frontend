import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LanguageService } from '../../../core/services/language.service';

/**
 * Generic placeholder for a flow that doesn't exist yet (signup, sign-in).
 * The landing page's CTAs route here instead of a dead link or a 404 while
 * the real auth module (backend module A) isn't built — see the
 * `// TODO:` comments on those CTAs in `landing.component.html`.
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './coming-soon.component.html',
  styleUrl: './coming-soon.component.scss',
})
export class ComingSoonComponent {
  /** Which flow this placeholder stands in for — set per route via data. */
  readonly flow = input<'get-started' | 'sign-in'>('get-started');

  private readonly languageService = inject(LanguageService);
  private readonly language = this.languageService.language;

  readonly copy = computed(() => {
    const isSignIn = this.flow() === 'sign-in';
    if (this.language() === 'hi') {
      return {
        heading: isSignIn ? 'साइन इन — जल्द आ रहा है' : 'खाता शुरू करना — जल्द आ रहा है',
        body: isSignIn
          ? 'साइन इन अभी तैयार नहीं है। यह सुविधा बहुत जल्द उपलब्ध होगी।'
          : 'नया खाता बनाना अभी तैयार नहीं है। यह सुविधा बहुत जल्द उपलब्ध होगी।',
        back: 'होम पेज पर वापस जाएं',
      };
    }
    return {
      heading: isSignIn ? 'Sign in — coming soon' : 'Get started — coming soon',
      body: isSignIn
        ? "Sign-in isn't ready yet. This is on its way very soon."
        : "Creating a new account isn't ready yet. This is on its way very soon.",
      back: 'Back to the home page',
    };
  });
}
