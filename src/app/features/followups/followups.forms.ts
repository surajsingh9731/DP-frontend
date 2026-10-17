import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { FollowupAction, FollowupTask } from '@sahmati/contracts';
import { FOLLOWUP_LIMITS } from '../../constants/followups.constants';
export function followupActionForm() {
  return new FormGroup({
    action: new FormControl<FollowupAction>('block', { nonNullable: true }),
    note: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/u),
        Validators.maxLength(FOLLOWUP_LIMITS.note),
      ],
    }),
    references: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(800)] }),
    assigneeId: new FormControl('', { nonNullable: true }),
    ack: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] }),
  });
}
export { syntheticEvidenceReferences as followupReferences } from '../../core/forms/synthetic-evidence';
export function followupActions(task: FollowupTask, owner: boolean): FollowupAction[] {
  const actions: FollowupAction[] = owner ? ['assign'] : [];
  if (task.status === 'independently_reviewed') return owner ? [...actions, 'reopen'] : [];
  actions.push('block');
  if (
    ['blocked', 'request_recorded', 'completion_declared', 'retention_exception_declared'].includes(
      task.status,
    ) &&
    (task.status !== 'retention_exception_declared' || owner)
  )
    actions.push('retry');
  if (task.location.mapping === 'unknown') return actions;
  if (['pending', 'request_recorded', 'completion_declared'].includes(task.status)) {
    if (task.status !== 'completion_declared') actions.push('record_request');
    actions.push('declare_complete');
    if (owner) actions.push('retain');
  }
  if (owner && task.status === 'completion_declared') actions.push('verify');
  return actions;
}
