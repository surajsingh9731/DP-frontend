import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  type ValidationErrors,
} from '@angular/forms';
import type { RegisterData } from '@sahmati/contracts';
import { requiredTextControl } from '../forms/required-text-control';
import { REGISTER_REFERENCE_LIMITS } from '../../constants/register.constants';
export const vendorReferenceForm = () =>
  new FormGroup({
    name: requiredTextControl(REGISTER_REFERENCE_LIMITS.name),
    service: requiredTextControl(REGISTER_REFERENCE_LIMITS.detail),
  });
export const storageReferenceForm = () =>
  new FormGroup({
    name: requiredTextControl(REGISTER_REFERENCE_LIMITS.name),
    medium: new FormControl<'digital' | 'paper'>('digital', { nonNullable: true }),
    location: requiredTextControl(REGISTER_REFERENCE_LIMITS.detail),
  });
function duplicateReferences(control: AbstractControl): ValidationErrors | null {
  const rows = control.value as Record<string, string>[];
  const values = rows.map((row) =>
    JSON.stringify(
      Object.values(row).map((value) => value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en')),
    ),
  );
  return new Set(values).size !== values.length
    ? { duplicate: true }
    : rows.length > REGISTER_REFERENCE_LIMITS.count
      ? { maximum: true }
      : null;
}
export function createReferencesForm() {
  return new FormGroup(
    {
      vendorReferences: new FormArray<ReturnType<typeof vendorReferenceForm>>([], {
        validators: duplicateReferences,
      }),
      storageReferences: new FormArray<ReturnType<typeof storageReferenceForm>>([], {
        validators: duplicateReferences,
      }),
      hasPaperRecords: new FormControl(false, { nonNullable: true }),
    },
    {
      validators: (control) => {
        const value = control.value as {
          hasPaperRecords: boolean;
          storageReferences: { medium: string }[];
        };
        return !value.hasPaperRecords &&
          value.storageReferences.some((row) => row.medium === 'paper')
          ? { paperMismatch: true }
          : null;
      },
    },
  );
}
export type ReferencesForm = ReturnType<typeof createReferencesForm>;
export function resetReferences(form: ReferencesForm, data?: RegisterData): void {
  form.controls.vendorReferences.clear();
  form.controls.storageReferences.clear();
  for (const value of data?.vendorReferences ?? []) {
    const row = vendorReferenceForm();
    row.setValue(value);
    form.controls.vendorReferences.push(row);
  }
  for (const value of data?.storageReferences ?? []) {
    const row = storageReferenceForm();
    row.setValue(value);
    form.controls.storageReferences.push(row);
  }
  form.controls.hasPaperRecords.setValue(data?.hasPaperRecords ?? false);
  form.markAsPristine();
  form.markAsUntouched();
}
