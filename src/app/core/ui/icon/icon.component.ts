import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'home'
  | 'shield'
  | 'inbox'
  | 'database'
  | 'file'
  | 'alert'
  | 'trash'
  | 'briefcase'
  | 'users'
  | 'cap'
  | 'settings'
  | 'check'
  | 'warning'
  | 'danger'
  | 'arrow-right'
  | 'bell'
  | 'logout';

/**
 * Minimal inline-SVG icon set (no emoji, no icon-font download — plan
 * priority #4). Covers the authenticated shell's nav + dashboard status
 * marks; extend the map rather than introducing a second icon mechanism.
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg
    [attr.width]="size()"
    [attr.height]="size()"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    @switch (name()) {
      @case ('home') {
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V21h14V9.5" />
      }
      @case ('shield') {
        <path d="M12 2 4 5v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V5l-8-3Z" />
      }
      @case ('inbox') {
        <path d="M4 12h4l2 3h4l2-3h4" />
        <path d="M4 12 5.5 5h13L20 12v7H4z" />
      }
      @case ('database') {
        <ellipse cx="12" cy="5" rx="8" ry="3" />
        <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" />
        <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      }
      @case ('file') {
        <path d="M6 2h9l5 5v15H6Z" />
        <path d="M14 2v6h6" />
      }
      @case ('alert') {
        <path d="M12 2 2 20h20Z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      }
      @case ('trash') {
        <path d="M4 6h16" />
        <path d="M8 6V4h8v2" />
        <path d="M6 6l1 14h10l1-14" />
      }
      @case ('briefcase') {
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M8 7V5h8v2" />
      }
      @case ('users') {
        <circle cx="9" cy="8" r="3" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M21 20c0-2.5-1.7-4.6-4-5.3" />
      }
      @case ('cap') {
        <path d="M2 9 12 4l10 5-10 5Z" />
        <path d="M6 11v5c0 1.5 2.7 2.5 6 2.5s6-1 6-2.5v-5" />
      }
      @case ('settings') {
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19 12a7 7 0 0 0-.1-1.1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.9-1.1L14.2 2H9.8l-.4 2.8a7 7 0 0 0-1.9 1.1l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .7.1 1.1l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.9 1.1l.4 2.8h4.4l.4-2.8a7 7 0 0 0 1.9-1.1l2.4 1 2-3.4-2-1.6c.1-.4.1-.7.1-1.1Z"
        />
      }
      @case ('check') {
        <path d="m4 12 6 6L20 6" />
      }
      @case ('warning') {
        <path d="M12 2 2 20h20Z" />
        <path d="M12 9v5" />
        <path d="M12 17h.01" />
      }
      @case ('danger') {
        <circle cx="12" cy="12" r="10" />
        <path d="M12 7v6" />
        <path d="M12 17h.01" />
      }
      @case ('arrow-right') {
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      }
      @case ('bell') {
        <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
        <path d="M10 20a2 2 0 0 0 4 0" />
      }
      @case ('logout') {
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      }
    }
  </svg>`,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number>(20);
}
