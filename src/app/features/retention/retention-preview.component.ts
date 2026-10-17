import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import type { RetentionPreviewPage } from '@sahmati/contracts';
import { RetentionCopy } from './retention-copy.service';
import { RETENTION_OUTCOMES } from '../../constants/retention.constants';
@Component({
  selector: 'app-retention-preview',
  imports: [DatePipe],
  templateUrl: './retention-preview.component.html',
  styleUrl: './retention-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetentionPreviewComponent {
  readonly copy = inject(RetentionCopy);
  readonly value = input.required<RetentionPreviewPage>();
  readonly busy = input(false);
  readonly next = output<void>();
  readonly first = output<void>();
  readonly outcomes = RETENTION_OUTCOMES;
}
