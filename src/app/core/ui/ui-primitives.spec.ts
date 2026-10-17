import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink, Router } from '@angular/router';
import { UiButtonDirective } from './ui-button.directive';
import { UiCardDirective } from './ui-card.directive';
import { UiTagDirective } from './ui-tag.directive';
import type { UiButtonVariant } from '../../constants/ui.constants';
@Component({
  imports: [UiButtonDirective, UiCardDirective, UiTagDirective, RouterLink],
  template: `<form (submit)="submit($event)">
      <button [sahmatiButton]="variant()" type="submit" [disabled]="busy()">{{ label() }}</button>
      <button sahmatiButton="secondary" type="button" (click)="cancelled = cancelled + 1">
        Cancel
      </button>
    </form>
    <a sahmatiButton="quiet" routerLink="/next">Continue</a>
    <article sahmatiCard aria-labelledby="title">
      <h2 id="title">Activity</h2>
      <p>Original content</p>
    </article>
    <span [sahmatiTag]="busy() ? 'warning' : 'success'">{{ busy() ? 'Pending' : 'Ready' }}</span>`,
})
class Host {
  variant = signal<UiButtonVariant>('primary');
  busy = signal(false);
  label = signal('Save');
  submits = 0;
  cancelled = 0;
  submit(event: Event) {
    event.preventDefault();
    this.submits++;
  }
}
describe('UX4G styling primitives retain native Angular behavior', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [Host],
      providers: [provideRouter([{ path: 'next', component: Host }])],
    }),
  );
  it('submits once, honors native disabled and keeps a secondary action out of form submission', async () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const [save, cancel] = f.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    save!.click();
    expect(f.componentInstance.submits).toBe(1);
    cancel!.click();
    expect(f.componentInstance.cancelled).toBe(1);
    expect(f.componentInstance.submits).toBe(1);
    f.componentInstance.busy.set(true);
    f.detectChanges();
    save!.click();
    expect(f.componentInstance.submits).toBe(1);
    expect(save!.disabled).toBe(true);
    expect(save!.getAttribute('type')).toBe('submit');
  });
  it('retains real anchor navigation and its accessible text', async () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const link = f.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/next');
    expect(link.textContent).toBe('Continue');
    link.click();
    await f.whenStable();
    expect(TestBed.inject(Router).url).toBe('/next');
  });
  it('updates variants and Hindi content without replacing the focused native control or adding handlers', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const save = f.nativeElement.querySelector('button') as HTMLButtonElement;
    save.focus();
    f.componentInstance.label.set('सहेजें');
    f.componentInstance.variant.set('danger');
    f.detectChanges();
    expect(f.nativeElement.querySelector('button')).toBe(save);
    expect(save.textContent).toBe('सहेजें');
    expect(save.classList.contains('ux4g-btn-danger')).toBe(true);
    expect(save.classList.contains('ux4g-btn-primary')).toBe(false);
    save.click();
    expect(f.componentInstance.submits).toBe(1);
  });
  it('preserves content semantics and state text in cards and tags', () => {
    const f = TestBed.createComponent(Host);
    f.detectChanges();
    const card = f.nativeElement.querySelector('article');
    expect(card.getAttribute('aria-labelledby')).toBe('title');
    expect(card.querySelector('h2').textContent).toBe('Activity');
    f.componentInstance.busy.set(true);
    f.detectChanges();
    const tag = f.nativeElement.querySelector('span');
    expect(tag.textContent).toBe('Pending');
    expect(tag.classList.contains('ux4g-tag-tonal-warning')).toBe(true);
  });
});
