import { UiButtonDirective } from '../ui/ui-button.directive';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../i18n.service';

@Component({
  selector: 'app-display-preferences',
  standalone: true,
  imports: [UiButtonDirective],
  host: { class: 'preferences' },
  templateUrl: './display-preferences.component.html',
  styleUrl: './display-preferences.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayPreferencesComponent {
  readonly i = inject(I18n);
}
