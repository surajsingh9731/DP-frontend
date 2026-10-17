import { FormControl, FormGroup, Validators } from '@angular/forms';
import { requiredTextControl } from '../../core/forms/required-text-control';
import { PREPARATION_LIMITS } from '../../constants/preparation.constants';
export function templateForm() {
  return new FormGroup({
    title: requiredTextControl(PREPARATION_LIMITS.title),
    body: requiredTextControl(PREPARATION_LIMITS.body),
    language: new FormControl<'en' | 'hi'>('en', { nonNullable: true }),
    sourceKind: new FormControl<'custom-draft' | 'education-sample'>('custom-draft', {
      nonNullable: true,
    }),
  });
}
export function contactForm() {
  return new FormGroup({
    displayName: requiredTextControl(PREPARATION_LIMITS.contactName),
    email: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(PREPARATION_LIMITS.email),
      ],
    }),
  });
}
