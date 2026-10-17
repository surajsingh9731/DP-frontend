import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import type { ConsentReceipt } from '@sahmati/contracts';
import { I18n } from '../../core/i18n.service';
import { CONSENT_EN, type ConsentTextKey } from './consent.en';
import { CONSENT_HI } from './consent.hi';
@Component({
  selector: 'app-consent-receipt',
  imports: [DatePipe],
  templateUrl: './consent-receipt.component.html',
  styleUrl: './consent-receipt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsentReceiptComponent {
  readonly receipt = input.required<ConsentReceipt>();
  readonly i = inject(I18n);
  t(key: ConsentTextKey) {
    return this.i.locale() === 'hi' ? CONSENT_HI[key] : CONSENT_EN[key];
  }
  label(id: string) {
    const p = this.receipt().offer.purposes.find((row) => row.id === id);
    return this.i.locale() === 'hi' ? p?.labelHi : p?.labelEn;
  }
}
