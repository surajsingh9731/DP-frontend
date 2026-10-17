import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { CheckResult } from '@sahmati/contracts';
import { CHECK_LIMITS } from '../../constants/checks.constants';
const text = (max: number) =>
  new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/u), Validators.maxLength(max)],
  });
export function evidenceReviewForm() {
  return new FormGroup({
    applicability: new FormControl<'applicable' | 'not_applicable'>('applicable', {
      nonNullable: true,
    }),
    result: new FormControl<CheckResult>('unknown', { nonNullable: true }),
    rationale: text(CHECK_LIMITS.rationale),
    references: text(800),
    validForMinutes: new FormControl(60, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(CHECK_LIMITS.minutes)],
    }),
    ack: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
}
export function locationReviewForm() {
  return new FormGroup({
    kind: new FormControl<'primary' | 'digital' | 'paper' | 'vendor'>('digital', {
      nonNullable: true,
    }),
    name: text(CHECK_LIMITS.label),
    detail: text(CHECK_LIMITS.label),
    rationale: text(CHECK_LIMITS.rationale),
    references: text(800),
    ack: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
}
