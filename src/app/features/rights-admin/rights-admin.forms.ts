import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { RightsAction, RightsStatus } from '@sahmati/contracts';
import { RIGHTS_LIMITS } from '../../constants/rights.constants';
export function rightsActionForm() {
  return new FormGroup({
    action: new FormControl<RightsAction>('begin_review', { nonNullable: true }),
    assigneeId: new FormControl('', { nonNullable: true }),
    workItemId: new FormControl('', { nonNullable: true }),
    note: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/u),
        Validators.maxLength(RIGHTS_LIMITS.note),
      ],
    }),
    references: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(800)] }),
    responseText: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(RIGHTS_LIMITS.response)],
    }),
    responseLanguage: new FormControl<'en' | 'hi'>('en', { nonNullable: true }),
    resolution: new FormControl<'complete' | 'partial' | 'blocked'>('blocked', {
      nonNullable: true,
    }),
    responseAck: new FormControl(false, { nonNullable: true }),
    closeAck: new FormControl(false, { nonNullable: true }),
    ack: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
}
export function rightsActions(status: RightsStatus, owner: boolean): RightsAction[] {
  if (status === 'closed') return owner ? ['reopen'] : [];
  if (status === 'responded') return owner ? ['close', 'reopen'] : [];
  if (status === 'requested') return owner ? ['assign', 'begin_review'] : ['begin_review'];
  return [
    ...(owner ? ['assign' as const] : []),
    ...(status === 'blocked' ? ['begin_review' as const] : []),
    'declare_item',
    ...(owner ? ['verify_item' as const] : []),
    'block_item',
    ...(owner ? ['retain_item' as const] : []),
    'retry_item',
    ...(owner ? ['respond' as const] : []),
  ];
}
