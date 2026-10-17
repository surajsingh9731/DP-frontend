import { FormControl, Validators } from '@angular/forms';
import { NON_WHITESPACE_PATTERN } from '../../constants/validation.constants';

export function requiredTextControl(maxLength: number): FormControl<string> {
  return new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      Validators.maxLength(maxLength),
      Validators.pattern(NON_WHITESPACE_PATTERN),
    ],
  });
}
