import { inject, Injectable } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { RETENTION_EN, type RetentionTextKey } from './locales/en';
import { RETENTION_HI } from './locales/hi';
@Injectable({ providedIn: 'root' })
export class RetentionCopy {
  readonly i = inject(I18n);
  t(key: RetentionTextKey) {
    return this.i.locale() === 'hi' ? RETENTION_HI[key] : RETENTION_EN[key];
  }
  message(key: RetentionTextKey | '') {
    return key ? this.t(key) : '';
  }
  code(value: string) {
    return Object.hasOwn(RETENTION_EN, value) ? this.t(value as RetentionTextKey) : value;
  }
}
