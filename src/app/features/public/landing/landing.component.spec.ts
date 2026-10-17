import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { LandingComponent } from './landing.component';
import { LanguageService } from '../../../core/services/language.service';

describe('LandingComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  it('renders the English heading by default', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const heading: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(heading.textContent).toContain('Data protection compliance');
  });

  it('switches to Hindi copy when the language service changes', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    const service = TestBed.inject(LanguageService);
    fixture.detectChanges();

    service.setLanguage('hi');
    fixture.detectChanges();

    const heading: HTMLElement = fixture.nativeElement.querySelector('h1');
    expect(heading.textContent).toContain('डेटा संरक्षण अनुपालन');
  });

  it('renders exactly one get-started and one sign-in CTA link per section pair', () => {
    const fixture = TestBed.createComponent(LandingComponent);
    fixture.detectChanges();

    const getStartedLinks = fixture.nativeElement.querySelectorAll('a[href="/get-started"]');
    const signInLinks = fixture.nativeElement.querySelectorAll('a[href="/sign-in"]');
    expect(getStartedLinks.length).toBe(2);
    expect(signInLinks.length).toBe(2);
  });
});
