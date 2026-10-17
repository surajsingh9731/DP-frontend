import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { RightsKind } from '@sahmati/contracts';
import { RIGHTS_LIMITS } from '../../constants/rights.constants';
export function participantRightsForm() {
  return new FormGroup({
    kind: new FormControl<RightsKind>('access', { nonNullable: true }),
    details: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/u),
        Validators.maxLength(RIGHTS_LIMITS.details),
      ],
    }),
    fieldReference: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(RIGHTS_LIMITS.correction)],
    }),
    requestedValue: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(RIGHTS_LIMITS.correction)],
    }),
    ack: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
}
