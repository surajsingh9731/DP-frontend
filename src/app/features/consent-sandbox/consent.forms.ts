import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import type { ConsentPurpose } from '@sahmati/contracts';
import { CONSENT_LIMITS } from '../../constants/consent.constants';
export function purposeForm() {
  return new FormGroup({
    id: new FormControl(crypto.randomUUID(), { nonNullable: true }),
    labelEn: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/u),
        Validators.maxLength(CONSENT_LIMITS.label),
      ],
    }),
    labelHi: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/u),
        Validators.maxLength(CONSENT_LIMITS.label),
      ],
    }),
  });
}
export function offerForm() {
  return new FormGroup({
    noticeId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    purposes: new FormArray([purposeForm()]),
    acknowledged: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });
}
export function choiceForms(purposes: ConsentPurpose[]) {
  return new FormArray(
    purposes.map(
      (p) =>
        new FormGroup({
          purposeId: new FormControl(p.id, { nonNullable: true }),
          decision: new FormControl<'' | 'allow' | 'decline'>('', {
            nonNullable: true,
            validators: [Validators.required],
          }),
        }),
    ),
  );
}
