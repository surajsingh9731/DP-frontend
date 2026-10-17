import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import axe from 'axe-core';
import { LoginComponent } from './login.component';
import { I18n } from '../../core/i18n.service';
describe('Sign-in accessibility structure', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });
  for (const locale of ['en', 'hi'] as const) {
    it(`has no detected axe A/AA structural violations in ${locale} email and verification states`, async () => {
      const fixture = TestBed.createComponent(LoginComponent);
      const i = TestBed.inject(I18n);
      i.locale.set(locale);
      fixture.detectChanges();
      await fixture.whenStable();
      for (const stage of ['email', 'code']) {
        fixture.componentInstance.stage.set(stage);
        fixture.detectChanges();
        await fixture.whenStable();
        const result = await axe.run(fixture.nativeElement, {
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
          rules: { 'color-contrast': { enabled: false } },
        });
        expect(
          result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
    });
  }
});
