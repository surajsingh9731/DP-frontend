export const FOLLOWUP_LIMITS = { note: 1000, evidenceRefs: 8, list: 100 } as const;
export const FOLLOWUP_KEY_PREFIX = 'sahmati.synthetic-followup';
export const FOLLOWUP_REFERENCE_PATTERN = /^sample-evidence:[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
