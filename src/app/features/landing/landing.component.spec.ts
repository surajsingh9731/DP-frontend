import { vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import axe from 'axe-core';
import { LandingComponent } from './landing.component';
import { LandingWalkthroughComponent } from './landing-walkthrough.component';
import { I18n } from '../../core/i18n.service';
import { LANDING_MOTION_KEY } from '../../constants/landing.constants';
import { routes } from '../../app.routes';
describe('Original interactive public landing', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
    });
  });
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.unstubAllGlobals();
  });
  async function open() {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }
  it('opens publicly and the primary CTA reaches the existing sign-in flow', async () => {
    const harness = await RouterTestingHarness.create('/');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Privacy work.');
    const cta =
      harness.routeNativeElement?.querySelector<HTMLAnchorElement>('main a[href="/login"]');
    expect(cta).toBeTruthy();
    cta!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
    expect(harness.routeNativeElement?.querySelector('input[type=email]')).toBeTruthy();
  });
  it('keeps every section link real and every interactive demonstration behind an explicit illustration label', async () => {
    const fixture = await open();
    for (const anchor of fixture.nativeElement.querySelectorAll('a[href^="#"]'))
      expect(fixture.nativeElement.querySelector(anchor.getAttribute('href'))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain(
      'Interactive illustration · no data is saved',
    );
    expect(fixture.nativeElement.querySelectorAll('.sector-options button')).toHaveLength(8);
  });
  it('walks all four steps and preserves keyboard-friendly native controls', async () => {
    const fixture = await open(),
      child = fixture.debugElement.query(By.directive(LandingWalkthroughComponent))
        .componentInstance as LandingWalkthroughComponent;
    for (const step of child.steps) {
      child.step.set(step);
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.story-panel').textContent).toContain(
        child.copy()[`${step}Title` as 'mapTitle'],
      );
      expect(
        fixture.nativeElement.querySelector(`.story-steps button[aria-pressed="true"]`),
      ).toBeTruthy();
    }
    child.move(1);
    expect(child.step()).toBe('map');
    child.move(-1);
    expect(child.step()).toBe('review');
  });
  it('starts with no illustrative choice selected, allows decline and never calls a consent or other write API', async () => {
    const fixture = await open(),
      child = fixture.debugElement.query(By.directive(LandingWalkthroughComponent))
        .componentInstance as LandingWalkthroughComponent;
    child.step.set('choice');
    fixture.detectChanges();
    expect(child.choice()).toBe('none');
    const buttons = fixture.nativeElement.querySelectorAll('.choice-actions button');
    expect(
      [...buttons].every((button: Element) => button.getAttribute('aria-pressed') === 'false'),
    ).toBe(true);
    buttons[0].click();
    fixture.detectChanges();
    expect(child.choice()).toBe('declined');
    expect(fixture.nativeElement.textContent).toContain(
      'This is not consent and creates no receipt.',
    );
    TestBed.inject(HttpTestingController).expectNone((request) => request.method !== 'GET');
  });
  it('updates sector story and walkthrough without treating planned packs as shipped sector rules', async () => {
    const fixture = await open();
    const buttons = fixture.nativeElement.querySelectorAll('.sector-options button');
    buttons[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.sector()).toBe('health');
    expect(fixture.nativeElement.querySelector('#sector-story').textContent).toContain(
      'sector pack planned',
    );
    expect(fixture.nativeElement.querySelector('.scene-meta').textContent).toContain('Health');
    expect(fixture.nativeElement.querySelector('#sector-story').textContent).toContain(
      'sample appointment enquiry',
    );
  });
  it('keeps training distinct from available guided setup and product illustration', async () => {
    const fixture = await open(),
      learning = fixture.nativeElement.querySelector('#learning');
    expect(learning.textContent).toContain('Staff training is a separate planned part');
    expect(learning.textContent).toContain('five short Hindi/English lessons');
    expect(learning.textContent).toContain('never certify legal compliance');
    expect(
      [...learning.querySelectorAll('article')].filter((card) =>
        card.textContent?.includes('Planned · not implemented yet'),
      ),
    ).toHaveLength(2);
    expect(learning.querySelectorAll('details li')).toHaveLength(5);
  });
  it('switches the full public experience, sector story and selected choice into Hindi without resetting state', async () => {
    const fixture = await open(),
      child = fixture.debugElement.query(By.directive(LandingWalkthroughComponent))
        .componentInstance as LandingWalkthroughComponent;
    child.step.set('choice');
    child.choice.set('declined');
    fixture.componentInstance.sector.set('health');
    fixture.nativeElement.querySelector('button[lang=hi]').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('hi');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('निजता');
    expect(fixture.nativeElement.querySelector('.choice-result').textContent).toContain('मना किया');
    expect(fixture.nativeElement.querySelector('#sector-story').textContent).toContain(
      'अपॉइंटमेंट',
    );
    expect(child.choice()).toBe('declined');
  });
  it('honors a system reduced-motion preference on entry and persists the user motion control', async () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const fixture = await open();
    expect(fixture.componentInstance.reduced()).toBe(true);
    expect(fixture.nativeElement.querySelector('.landing').classList.contains('motion-off')).toBe(
      true,
    );
    fixture.componentInstance.toggleMotion();
    expect(localStorage.getItem(LANDING_MOTION_KEY)).toBe('false');
    fixture.componentInstance.toggleMotion();
    expect(localStorage.getItem(LANDING_MOTION_KEY)).toBe('true');
  });
  for (const language of ['en', 'hi'] as const)
    it(`passes structural axe checks including choice/review controls in ${language}`, async () => {
      const fixture = await open();
      TestBed.inject(I18n).locale.set(language);
      const child = fixture.debugElement.query(By.directive(LandingWalkthroughComponent))
        .componentInstance as LandingWalkthroughComponent;
      for (const step of ['choice', 'review'] as const) {
        child.step.set(step);
        fixture.detectChanges();
        document.body.appendChild(fixture.nativeElement);
        const result = await axe.run(fixture.nativeElement, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
          rules: { 'color-contrast': { enabled: false } },
        });
        expect(
          result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
        fixture.nativeElement.remove();
      }
    });
});
