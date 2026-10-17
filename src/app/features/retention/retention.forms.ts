import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { RetentionHold } from '@sahmati/contracts';
function text(max: number) {
  return new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/u), Validators.maxLength(max)],
  });
}
function ack() {
  return new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] });
}
export function retentionPolicyForm() {
  return new FormGroup({
    name: text(120),
    durationDays: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(36500),
        Validators.pattern(/^\d+$/),
      ],
    }),
    rationale: text(1200),
    ack: ack(),
  });
}
export function retentionDecisionForm() {
  return new FormGroup({
    reason: text(1200),
    ack: ack(),
    reviewAck: new FormControl(false, { nonNullable: true }),
  });
}
export function retentionHoldForm() {
  return new FormGroup({
    scope: new FormControl<RetentionHold['scope']>('activity', { nonNullable: true }),
    target: new FormControl('', { nonNullable: true }),
    reason: text(1200),
    ack: ack(),
  });
}
export function retentionScenarioForm() {
  return new FormGroup({ asOf: text(40), ack: ack() });
}
