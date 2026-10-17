export const CHECK_LIMITS = { rationale: 1000, label: 160, minutes: 1440 } as const;
export const CHECK_KEY_PREFIX = 'sahmati.local-checks';
export const CHECK_RESULTS = ['pass', 'fail', 'unknown', 'not_applicable'] as const;
export const CHECK_MAPPING_KINDS = ['primary', 'digital', 'paper', 'vendor'] as const;
