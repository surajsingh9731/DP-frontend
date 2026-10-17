import { requiredTextControl } from './required-text-control';
import { REGISTER_LIMITS, REGISTER_CATEGORY_LIMITS } from '../../constants/register.constants';

/** Shared base fields for guided setup and the register; references remain register-owned. */
export function createRegisterFields() {
  return {
    name: requiredTextControl(REGISTER_LIMITS.name),
    purposeEn: requiredTextControl(REGISTER_LIMITS.purposeEn),
    purposeHi: requiredTextControl(REGISTER_LIMITS.purposeHi),
    dataCategories: requiredTextControl(REGISTER_LIMITS.dataCategories),
    storageLocation: requiredTextControl(REGISTER_LIMITS.storageLocation),
    retentionNote: requiredTextControl(REGISTER_LIMITS.retentionNote),
    contact: requiredTextControl(REGISTER_LIMITS.contact),
  };
}

/** Preserve order and duplicates; authoritative normalization/validation stays on the server. */
export function parseRegisterCategories(text: string): string[] | null {
  const values = text
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return !values.length ||
    values.length > REGISTER_CATEGORY_LIMITS.count ||
    values.some((value) => value.length > REGISTER_CATEGORY_LIMITS.length)
    ? null
    : values;
}
