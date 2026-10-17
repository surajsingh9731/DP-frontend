import { UiTagDirective } from '../../core/ui/ui-tag.directive';
import { UiCardDirective } from '../../core/ui/ui-card.directive';
import { UiButtonDirective } from '../../core/ui/ui-button.directive';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { LANDING_EN } from './locales/en';
import { LANDING_HI } from './locales/hi';
import {
  LANDING_STEPS,
  type LandingSector,
  type LandingStep,
} from '../../constants/landing.constants';
@Component({
  selector: 'app-landing-walkthrough',
  imports: [UiButtonDirective, UiCardDirective, UiTagDirective],
  templateUrl: './landing-walkthrough.component.html',
  styleUrl: './landing-walkthrough.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingWalkthroughComponent {
  readonly language = input<'en' | 'hi'>('en');
  readonly sector = input<LandingSector>('education');
  readonly copy = computed(() => (this.language() === 'hi' ? LANDING_HI : LANDING_EN));
  readonly step = signal<LandingStep>('map');
  readonly choice = signal<'none' | 'allowed' | 'declined'>('none');
  readonly steps = LANDING_STEPS;
  readonly index = computed(() => this.steps.indexOf(this.step()));
  readonly story = computed(() => this.copy().sectorStories[this.sector()]);
  move(delta: number) {
    this.step.set(this.steps[(this.index() + delta + this.steps.length) % this.steps.length]!);
  }
}
