export const REFERENCES_EN = {
  title: 'Internal references',
  warning:
    'Declared references only. These entries do not verify vendors, contracts or deletion arrangements and are not included in the public notice preview. Describe systems and services, not personal records.',
  vendors: 'Vendor references',
  storage: 'Storage references',
  name: 'Reference name',
  service: 'Service provided',
  medium: 'Storage medium',
  digital: 'Digital',
  paper: 'Paper',
  location: 'Storage location',
  addVendor: 'Add vendor reference',
  addStorage: 'Add storage reference',
  remove: 'Remove reference',
  paperFlag: 'This activity has paper records',
  unknown: 'Paper records are declared, but their storage is not mapped yet.',
  mismatch: 'Paper storage is listed. Confirm that this activity has paper records before saving.',
  invalid:
    'Complete each reference. Names: up to 100 characters; service/location: up to 200. Duplicate references are not allowed.',
  limit: 'Up to 10 references in each section.',
  none: 'None declared',
  yes: 'Yes',
  no: 'No',
} as const;
export type ReferenceTextKey = keyof typeof REFERENCES_EN;
