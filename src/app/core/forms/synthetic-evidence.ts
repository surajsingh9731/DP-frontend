import { FOLLOWUP_LIMITS, FOLLOWUP_REFERENCE_PATTERN } from '../../constants/followups.constants';
export function syntheticEvidenceReferences(value: string): string[] | null {
  const refs = value
    .split(/\r?\n/u)
    .map((s) => s.trim())
    .filter(Boolean);
  return refs.length <= FOLLOWUP_LIMITS.evidenceRefs &&
    new Set(refs).size === refs.length &&
    refs.every((ref) => FOLLOWUP_REFERENCE_PATTERN.test(ref))
    ? refs
    : null;
}
