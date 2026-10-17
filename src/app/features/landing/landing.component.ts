import { UiTagDirective } from '../../core/ui/ui-tag.directive';
import { UiCardDirective } from '../../core/ui/ui-card.directive';
import { UiButtonDirective } from '../../core/ui/ui-button.directive';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18n } from '../../core/i18n.service';
import { DisplayPreferencesComponent } from '../../core/display-preferences/display-preferences.component';
import { LANDING_EN } from './locales/en';
import { LANDING_HI } from './locales/hi';
import {
  LANDING_SECTORS,
  LANDING_MOTION_KEY,
  type LandingSector,
} from '../../constants/landing.constants';
import { LandingWalkthroughComponent } from './landing-walkthrough.component';
@Component({
  selector: 'app-landing',
  imports: [
    UiButtonDirective,
    UiCardDirective,
    UiTagDirective,
    RouterLink,
    DisplayPreferencesComponent,
    LandingWalkthroughComponent,
  ],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent {
  readonly i = inject(I18n);
  readonly c = computed(() => (this.i.locale() === 'hi' ? LANDING_HI : LANDING_EN));
  readonly sector = signal<LandingSector>('education');
  readonly sectors = LANDING_SECTORS;
  readonly sectorStory = computed(() => this.c().sectorStories[this.sector()]);
  readonly reduced = signal(
    localStorage.getItem(LANDING_MOTION_KEY) === 'true' ||
      (typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches),
  );
  toggleMotion() {
    this.reduced.update((value) => !value);
    localStorage.setItem(LANDING_MOTION_KEY, String(this.reduced()));
  }
}
