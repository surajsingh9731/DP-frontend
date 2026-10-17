import { Injectable, signal } from '@angular/core';

/** The two languages Sahmati ships with for R1 (brief: bilingual EN/HI, not an afterthought). */
export type AppLanguage = 'en' | 'hi';

const STORAGE_KEY = 'sahmati.language';

/**
 * Holds the viewer's chosen UI language as a signal and persists the
 * choice for their next visit.
 *
 * Deliberately does *not* touch the DOM itself (no `document.documentElement`
 * writes) — the component that owns the relevant subtree (e.g.
 * `PublicShellComponent`) binds `[attr.lang]` to `language()` directly, so
 * the `lang` attribute always sits on the actual content boundary rather
 * than being set imperatively from a service that can't know which
 * subtree is "the page" in every context (plan §6: `lang` must reflect
 * the real subtree, not just the whole document by convention).
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<AppLanguage>(this.readStored());

  setLanguage(lang: AppLanguage): void {
    this.language.set(lang);
    this.writeStored(lang);
  }

  toggle(): void {
    this.setLanguage(this.language() === 'en' ? 'hi' : 'en');
  }

  private readStored(): AppLanguage {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'hi' ? 'hi' : 'en';
    } catch {
      // Private browsing / storage blocked — fall back to English in memory.
      return 'en';
    }
  }

  private writeStored(lang: AppLanguage): void {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage unavailable — the choice still works for this page view
      // via the signal, it just won't be remembered next visit.
    }
  }
}
