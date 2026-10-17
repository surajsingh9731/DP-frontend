import { TestBed } from '@angular/core/testing';
import { EN, HI, I18n } from './i18n.service';
describe('Bilingual preferences', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });
  it('provides a nonempty Hindi equivalent for every English UI label', () => {
    expect(Object.keys(HI).sort()).toEqual(Object.keys(EN).sort());
    for (const value of Object.values(HI)) expect(value.trim().length).toBeGreaterThan(0);
  });
  it('updates language metadata and scalable display preferences without losing language', () => {
    const i = TestBed.inject(I18n);
    i.locale.set('hi');
    i.large.set(true);
    i.contrast.set(true);
    TestBed.tick();
    expect(document.documentElement.lang).toBe('hi');
    expect(document.documentElement.classList.contains('large-text')).toBe(true);
    expect(localStorage.getItem('sahmati.locale')).toBe('hi');
    expect(i.t('email')).toBe(HI.email);
  });
  it('resolves an existing status message in the newly selected language', () => {
    const i = TestBed.inject(I18n);
    expect(i.resolve('taskClosed')).toBe(EN.taskClosed);
    i.locale.set('hi');
    expect(i.resolve('taskClosed')).toBe(HI.taskClosed);
    expect(i.resolve('')).toBe('');
  });
});
