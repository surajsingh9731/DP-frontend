export const EVIDENCE_KINDS = [
  'notice',
  'notice_decision',
  'consent',
  'withdrawal',
  'followup',
  'check_review',
  'check_evaluation',
  'rights',
] as const;
export const EVIDENCE_PROVENANCE = ['recorded', 'manual', 'computed'] as const;
export const EVIDENCE_PAGE_SIZES = [10, 20, 50] as const;
