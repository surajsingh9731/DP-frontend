import { Directive } from '@angular/core';
/** Official card visual anatomy; content semantics and layout remain in the external template. */
@Directive({
  selector: '[sahmatiCard]',
  host: { class: 'sahmati-card ux4g-card ux4g-card-outline ux4g-card-vertical' },
})
export class UiCardDirective {}
