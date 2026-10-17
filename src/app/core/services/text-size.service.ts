import { Injectable, signal } from '@angular/core';

export type TextSize = 'normal' | 'large';

const STORAGE_KEY = 'sahmati.text-size';

/**
 * The public shell's "large text" toggle (brief §13.5) — independent of
 * browser/OS zoom, for a one-tap bump on a small phone screen. Scales the
 * `--text-scale` token consumed by `src/styles/_base.scss`.
 */
@Injectable({ providedIn: 'root' })
export class TextSizeService {
  readonly size = signal<TextSize>(this.readStored());

  toggle(): void {
    this.setSize(this.size() === 'normal' ? 'large' : 'normal');
  }

  setSize(size: TextSize): void {
    this.size.set(size);
    try {
      localStorage.setItem(STORAGE_KEY, size);
    } catch {
      // Storage unavailable — still works for this page view via the signal.
    }
  }

  private readStored(): TextSize {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'large' ? 'large' : 'normal';
    } catch {
      return 'normal';
    }
  }
}
