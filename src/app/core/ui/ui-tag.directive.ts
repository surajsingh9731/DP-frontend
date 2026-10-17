import { computed, Directive, input } from '@angular/core';
import { UI_TAG_CLASSES, type UiTagVariant } from '../../constants/ui.constants';
@Directive({ selector: '[sahmatiTag]', host: { '[class]': 'classes()' } })
export class UiTagDirective {
  readonly variant = input<UiTagVariant>('neutral', { alias: 'sahmatiTag' });
  readonly classes = computed(
    () => `sahmati-tag ux4g-tag ux4g-tag-s ${UI_TAG_CLASSES[this.variant()]}`,
  );
}
