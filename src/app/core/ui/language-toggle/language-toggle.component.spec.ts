import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { LanguageToggleComponent } from './language-toggle.component';
import { LanguageService } from '../../services/language.service';

describe('LanguageToggleComponent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to English and switches to Hindi on selection', () => {
    const fixture = TestBed.createComponent(LanguageToggleComponent);
    const service = TestBed.inject(LanguageService);
    fixture.detectChanges();

    expect(service.language()).toBe('en');

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(2);

    (buttons[1] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(service.language()).toBe('hi');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[0].getAttribute('aria-pressed')).toBe('false');
  });

  it('marks each option with its own lang attribute', () => {
    const fixture = TestBed.createComponent(LanguageToggleComponent);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].getAttribute('lang')).toBe('en');
    expect(buttons[1].getAttribute('lang')).toBe('hi');
  });
});
