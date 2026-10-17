import { computed, Directive, input } from '@angular/core';
import { UI_BUTTON_CLASSES, type UiButtonVariant } from '../../constants/ui.constants';
/** Styling only: native type, disabled, link, keyboard and Angular events stay on the host. */
@Directive({
  selector: 'button[sahmatiButton], a[sahmatiButton]',
  host: { '[class]': 'classes()' },
})
export class UiButtonDirective {
  readonly variant = input<UiButtonVariant>('primary', { alias: 'sahmatiButton' });
  readonly classes = computed(
    () => `sahmati-button ux4g-btn-m ${UI_BUTTON_CLASSES[this.variant()]}`,
  );
}
