import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { LoginComponent } from './login.component';
describe('Local sign-in form', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  it('rejects invalid email and does not create a network request', () => {
    const component = TestBed.createComponent(LoginComponent).componentInstance;
    component.email.setValue('wrong');
    component.request();
    expect(component.error()).not.toBe('');
    TestBed.inject(HttpTestingController).expectNone('/api/auth/challenges');
  });
  it('blocks duplicate submits while pending and resumes a challenge after navigation', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    component.request();
    const http = TestBed.inject(HttpTestingController);
    http
      .expectOne('/api/auth/challenges')
      .flush({ challengeId: 'test-challenge', message: 'generic' });
    expect(component.stage()).toBe('code');
    expect(component.busy()).toBe(false);
    fixture.destroy();
    const resumed = TestBed.createComponent(LoginComponent).componentInstance;
    expect(resumed.stage()).toBe('code');
    expect(resumed.email.value).toBe('owner@demo.sahmati.test');
  });
  it('recovers from request failure and can retry without a false success', () => {
    const component = TestBed.createComponent(LoginComponent).componentInstance;
    const http = TestBed.inject(HttpTestingController);
    component.request();
    http.expectOne('/api/auth/challenges').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(component.busy()).toBe(false);
    expect(component.stage()).toBe('email');
    expect(component.error()).not.toBe('');
    component.request();
    http
      .expectOne('/api/auth/challenges')
      .flush({ challengeId: 'retry-challenge', message: 'generic' });
    expect(component.stage()).toBe('code');
  });
});
