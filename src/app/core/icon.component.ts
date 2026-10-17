import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ICON_PATHS } from '../constants/icon.constants';
@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input<keyof typeof ICON_PATHS>('home');
  readonly paths = ICON_PATHS;
}
