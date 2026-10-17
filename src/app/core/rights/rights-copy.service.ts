import { Injectable, inject } from '@angular/core';
import { I18n } from '../i18n.service';
import { RIGHTS_EN, type RightsTextKey } from './rights.en';
import { RIGHTS_HI } from './rights.hi';
@Injectable({ providedIn: 'root' })
export class RightsCopy {
  readonly i = inject(I18n);
  t(key: RightsTextKey) {
    return this.i.locale() === 'hi' ? RIGHTS_HI[key] : RIGHTS_EN[key];
  }
  message(key: RightsTextKey | '') {
    return key ? this.t(key) : '';
  }
}
