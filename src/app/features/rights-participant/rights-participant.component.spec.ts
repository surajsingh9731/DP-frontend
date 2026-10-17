import { vi } from 'vitest';
import { registerLocaleData } from '@angular/common';
import hindiLocale from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import axe from 'axe-core';
import { Api } from '../../core/api.service';
registerLocaleData(hindiLocale);
import { tenant, session, own, publicRow, view } from '../../core/rights/rights.fixture.spec-data';
import { RightsParticipantComponent } from './rights-participant.component';
describe('Scoped synthetic participant rights', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  function role(value: 'owner' | 'staff' | 'viewer') {
    TestBed.inject(Api).session.set({
      displayName: 'Synthetic',
      memberships: [{ tenantId: tenant, name: 'Sample', branch: 'Branch', role: value }],
    });
  }
  afterEach(() => {
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    params = new BehaviorSubject(convertToParamMap({ tenantId: tenant, sessionId: session }));
    TestBed.configureTestingModule({
      imports: [RightsParticipantComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
      ],
    });
    role('owner');
  });
  async function open() {
    const fixture = TestBed.createComponent(RightsParticipantComponent);
    TestBed.inject(HttpTestingController).expectOne(own).flush(view);
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    fixture.detectChanges();
    return fixture;
  }
  function fill(component: RightsParticipantComponent) {
    component.form.patchValue({
      kind: 'correction',
      details: 'Synthetic amendment only',
      fieldReference: 'Synthetic field',
      requestedValue: 'Synthetic value',
      ack: true,
    });
  }
  it('shows approved partial response and unresolved counts without internal evidence or vendor details', async () => {
    const fixture = await open();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain(publicRow.responses[0]!.text);
    expect(text).not.toContain('Private synthetic vendor');
    expect(text).not.toContain('Internal only');
    expect(fixture.componentInstance.data()!.requests[0]!.progress.unknown).toBe(1);
  });
  it('requires explicit synthetic acknowledgement and correction fields', async () => {
    const fixture = await open(),
      component = fixture.componentInstance;
    await component.submit();
    expect(component.error()).toBe('invalid');
    fill(component);
    component.form.controls.fieldReference.setValue(' ');
    await component.submit();
    expect(component.error()).toBe('invalid');
    TestBed.inject(HttpTestingController).expectNone((r) => r.method === 'POST');
  });
  it('submits an actual form and preserves retry key and entered fields after a server failure', async () => {
    const fixture = await open(),
      component = fixture.componentInstance;
    fill(component);
    fixture.detectChanges();
    fixture.nativeElement
      .querySelector('form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const http = TestBed.inject(HttpTestingController),
      first = await vi.waitFor(() => http.expectOne(own));
    expect(first.request.body).toMatchObject({
      kind: 'correction',
      correction: { fieldReference: 'Synthetic field', requestedValue: 'Synthetic value' },
      syntheticOnlyAcknowledged: true,
    });
    const key = first.request.body.idempotencyKey;
    first.flush({}, { status: 503, statusText: 'Unavailable' });
    await vi.waitFor(() => expect(component.busy()).toBe(false));
    expect(component.form.controls.details.value).toBe('Synthetic amendment only');
    const pending = component.submit(),
      retry = await vi.waitFor(() => http.expectOne(own));
    expect(retry.request.body.idempotencyKey).toBe(key);
    retry.flush(publicRow);
    await vi.waitFor(() => http.expectOne(own)).then((r) => r.flush(view));
    await pending;
    expect(component.form.controls.ack.value).toBe(false);
    expect(component.status()).toBe('saved');
  });
  it('omits correction values for access and pins the selected interface language', async () => {
    const fixture = await open(),
      component = fixture.componentInstance;
    fill(component);
    component.form.controls.kind.setValue('access');
    component.copy.i.locale.set('hi');
    const pending = component.submit(),
      http = TestBed.inject(HttpTestingController),
      request = await vi.waitFor(() => http.expectOne(own));
    expect(request.request.body.inputLanguage).toBe('hi');
    expect(request.request.body.correction).toBeUndefined();
    request.flush(publicRow);
    await vi.waitFor(() => http.expectOne(own)).then((r) => r.flush(view));
    await pending;
  });
  it('clears prior personal projection after an expired or unauthorized session', async () => {
    const fixture = await open(),
      component = fixture.componentInstance;
    const pending = component.load();
    TestBed.inject(HttpTestingController)
      .expectOne(own)
      .flush({}, { status: 403, statusText: 'Forbidden' });
    await pending;
    fixture.detectChanges();
    expect(component.data()).toBeNull();
    expect(component.error()).toBe('expired');
    expect(fixture.nativeElement.textContent).not.toContain(publicRow.details);
  });
  it('does not let a viewer submit even if form values are supplied', async () => {
    role('viewer');
    const fixture = await open();
    fill(fixture.componentInstance);
    await fixture.componentInstance.submit();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    TestBed.inject(HttpTestingController).expectNone((r) => r.method === 'POST');
  });
  it('discards a late response from another tenant/session', async () => {
    const fixture = TestBed.createComponent(RightsParticipantComponent),
      http = TestBed.inject(HttpTestingController),
      old = http.expectOne(own);
    params.next(convertToParamMap({ tenantId: 'other', sessionId: 'other-session' }));
    http
      .expectOne('/api/tenants/other/consent-sandbox/sessions/other-session/requests')
      .flush({ ...view, requests: [] });
    old.flush(view);
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    expect(fixture.componentInstance.data()?.requests.length).toBe(0);
  });
  for (const language of ['en', 'hi'] as const)
    it(`has labelled controls and no axe violations in ${language}`, async () => {
      const fixture = await open();
      fixture.componentInstance.copy.i.locale.set(language);
      fixture.detectChanges();
      document.body.appendChild(fixture.nativeElement);
      const result = await axe.run(fixture.nativeElement, {
        rules: { 'color-contrast': { enabled: false } },
      });
      expect(result.violations).toEqual([]);
      fixture.nativeElement.remove();
    });
});
