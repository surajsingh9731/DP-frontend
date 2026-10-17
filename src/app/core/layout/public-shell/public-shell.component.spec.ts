import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';
import { PublicShellComponent } from './public-shell.component';
import { LanguageService } from '../../services/language.service';

describe('PublicShellComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
  });

  it('sets the lang attribute on its own host, matching the selected language', () => {
    const fixture = TestBed.createComponent(PublicShellComponent);
    const service = TestBed.inject(LanguageService);
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('lang')).toBe('en');

    service.setLanguage('hi');
    fixture.detectChanges();

    expect(fixture.nativeElement.getAttribute('lang')).toBe('hi');
  });

  it('renders a skip link pointing at the main content region', () => {
    const fixture = TestBed.createComponent(PublicShellComponent);
    fixture.detectChanges();

    const skipLink: HTMLAnchorElement = fixture.nativeElement.querySelector('.skip-link');
    expect(skipLink.getAttribute('href')).toBe('#main-content');
    expect(fixture.nativeElement.querySelector('#main-content')).toBeTruthy();
  });
});
