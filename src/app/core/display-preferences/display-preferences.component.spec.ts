import { TestBed } from '@angular/core/testing';
import { DisplayPreferencesComponent } from './display-preferences.component';

describe('Shared display preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ imports: [DisplayPreferencesComponent] });
  });
  it('switches language and exposes independent pressed states for display options', async () => {
    const fixture = TestBed.createComponent(DisplayPreferencesComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button[lang="hi"]').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('hi');
    expect(fixture.nativeElement.querySelector('summary').textContent).toContain('दिखावट');
    const buttons = fixture.nativeElement.querySelectorAll('.preferences__panel button');
    buttons[0].click();
    fixture.detectChanges();
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('false');
    buttons[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });
});
