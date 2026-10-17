import { FormControl, FormGroup, Validators } from '@angular/forms';
export function evidenceFiltersForm() {
  return new FormGroup({
    q: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(80)] }),
    kind: new FormControl('', { nonNullable: true }),
    provenance: new FormControl('', { nonNullable: true }),
    limit: new FormControl(20, { nonNullable: true }),
  });
}
