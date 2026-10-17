import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import type { ParticipantRightsRequest } from '@sahmati/contracts';
import { RightsCopy } from './rights-copy.service';
@Component({
  selector: 'app-rights-public-card',
  imports: [DatePipe],
  templateUrl: './rights-public-card.component.html',
  styleUrl: './rights-public-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightsPublicCardComponent {
  readonly request = input.required<ParticipantRightsRequest>();
  readonly copy = inject(RightsCopy);
}
