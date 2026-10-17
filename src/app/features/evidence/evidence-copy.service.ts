import { inject, Injectable } from '@angular/core';
import { I18n } from '../../core/i18n.service';
import { EVIDENCE_EN, type EvidenceTextKey } from './locales/en';
import { EVIDENCE_HI } from './locales/hi';
@Injectable({ providedIn: 'root' })
export class EvidenceCopy {
  readonly i = inject(I18n);
  t(key: EvidenceTextKey) {
    return this.i.locale() === 'hi' ? EVIDENCE_HI[key] : EVIDENCE_EN[key];
  }
  code(value: string) {
    return Object.hasOwn(EVIDENCE_EN, value) ? this.t(value as EvidenceTextKey) : this.t('unknown');
  }
  message(key: EvidenceTextKey | '') {
    return key ? this.t(key) : '';
  }
}
