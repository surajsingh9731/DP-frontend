export const RETENTION_KEY_PREFIX = 'sahmati-retention';
export const RETENTION_HOLD_SCOPES = ['activity', 'sample_record', 'location'] as const;
export const RETENTION_OUTCOMES = [
  'held',
  'conflict',
  'unknown',
  'not_due',
  'candidate_review',
] as const;
