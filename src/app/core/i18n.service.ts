import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';
import { EN, type TextKey } from './locales/en';
import { HI } from './locales/hi';
import { PREFERENCE_KEYS } from '../constants/preferences.constants';
export { EN, type TextKey } from './locales/en';
export { HI } from './locales/hi';
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly document = inject(DOCUMENT);
  readonly locale = signal<'en' | 'hi'>(
    localStorage.getItem(PREFERENCE_KEYS.locale) === 'hi' ? 'hi' : 'en',
  );
  readonly large = signal(localStorage.getItem(PREFERENCE_KEYS.large) === 'true');
  readonly contrast = signal(localStorage.getItem(PREFERENCE_KEYS.contrast) === 'true');
  constructor() {
    effect(() => {
      const lang = this.locale();
      this.document.documentElement.lang = lang;
      this.document.documentElement.classList.toggle('large-text', this.large());
      this.document.documentElement.classList.toggle('high-contrast', this.contrast());
      localStorage.setItem(PREFERENCE_KEYS.locale, lang);
      localStorage.setItem(PREFERENCE_KEYS.large, String(this.large()));
      localStorage.setItem(PREFERENCE_KEYS.contrast, String(this.contrast()));
    });
  }
  resolve(key: TextKey | ''): string {
    return key ? this.t(key) : '';
  }
  t(key: TextKey): string {
    return this.locale() === 'hi' ? HI[key] : EN[key];
  }
}
