import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The error/status announcement pair repeated at the top of nearly every
 * feature screen: an assertive `role="alert"` for the current error (if
 * any) and a polite `role="status"` for the current success/info message,
 * optionally suffixed with a loading indicator.
 *
 * Callers still own their own i18n lookup — this component only renders
 * already-resolved text, so it carries no dependency on any one feature's
 * copy service.
 */
@Component({
  selector: 'app-status-banner',
  templateUrl: './status-banner.component.html',
  styleUrl: './status-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBannerComponent {
  readonly errorText = input('');
  readonly statusText = input('');
  readonly loading = input(false);
  readonly loadingText = input('');
}
