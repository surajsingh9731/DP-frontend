export const REGISTER_FIELDS = [
  'name',
  'purposeEn',
  'purposeHi',
  'dataCategories',
  'storageLocation',
  'retentionNote',
  'contact',
] as const;
export const REGISTER_LIMITS = {
  name: 120,
  purposeEn: 1000,
  purposeHi: 1000,
  dataCategories: 3000,
  storageLocation: 200,
  retentionNote: 500,
  contact: 200,
} as const;
export const REGISTER_CATEGORY_LIMITS = { count: 20, length: 100 } as const;

export const REGISTER_REFERENCE_LIMITS = { count: 10, name: 100, detail: 200 } as const;
