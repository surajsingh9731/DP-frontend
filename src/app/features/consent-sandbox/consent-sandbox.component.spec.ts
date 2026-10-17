import { vi } from 'vitest';
import { registerLocaleData } from '@angular/common';
import hindiLocale from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import axe from 'axe-core';
import type { ConsentOffer, ConsentParticipant, ConsentReceipt } from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { ConsentSandboxComponent } from './consent-sandbox.component';
registerLocaleData(hindiLocale);
const tenant = 'consent-test',
  path = `/api/tenants/${tenant}/consent-sandbox`;
const offer: ConsentOffer = {
  id: 'offer-one',
  version: 2,
  catalogHash: 'a'.repeat(64),
  createdAt: '2026-10-17T00:00:00Z',
  notice: {
    id: 'notice-one',
    entryVersion: 3,
    language: 'en',
    title: 'Synthetic notice',
    body: 'Synthetic body',
    warning: 'Unreviewed sample',
  },
  purposes: [
    { id: 'purpose-one', labelEn: 'Sample updates', labelHi: 'नमूना समाचार' },
    { id: 'purpose-two', labelEn: 'Sample reports', labelHi: 'नमूना रिपोर्ट' },
  ],
};
const participant: ConsentParticipant = {
  id: 'session-one',
  offer,
  syntheticReference: 'Sample adult sample',
  expiresAt: '2026-10-17T12:00:00Z',
  version: 0,
  receipts: [],
};
const receipt: ConsentReceipt = {
  id: 'receipt-one',
  sessionId: participant.id,
  syntheticReference: participant.syntheticReference,
  offer,
  version: 1,
  kind: 'choices_recorded',
  choices: [
    { purposeId: 'purpose-one', decision: 'allow' },
    { purposeId: 'purpose-two', decision: 'decline' },
  ],
  interfaceLanguage: 'hi',
  occurredAt: '2026-10-17T10:00:00Z',
  previousReceiptHash: null,
  receiptHash: 'b'.repeat(64),
  mode: 'local-sample',
  assurance: 'unverified-synthetic-adult',
  legalReviewStatus: 'unreviewed',
  contactVerification: 'unverified',
  deletionStatus: 'not-performed',
};
describe('Synthetic consent lab', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    params = new BehaviorSubject(convertToParamMap({ tenantId: tenant }));
    TestBed.configureTestingModule({
      imports: [ConsentSandboxComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: params } },
      ],
    });
    role('owner');
  });
  afterEach(() => TestBed.inject(HttpTestingController).verify());
  function role(value: 'owner' | 'staff' | 'viewer') {
    TestBed.inject(Api).session.set({
      displayName: 'Synthetic',
      memberships: [{ tenantId: tenant, name: 'Synthetic', branch: 'Branch', role: value }],
    });
  }
  function flushLoad(selectedTenant = tenant) {
    const http = TestBed.inject(HttpTestingController),
      prefix = `/api/tenants/${selectedTenant}`;
    http.expectOne(`${prefix}/consent-sandbox/offers`).flush([offer]);
    http.expectOne(`${prefix}/consent-sandbox/receipts`).flush([]);
    http.expectOne(`${prefix}/notices`).flush([]);
  }
  function open() {
    const fixture = TestBed.createComponent(ConsentSandboxComponent);
    flushLoad();
    fixture.detectChanges();
    return fixture;
  }
  async function start(fixture: ReturnType<typeof open>) {
    const component = fixture.componentInstance;
    component.adultAcknowledged.setValue(true);
    const pending = component.start(offer);
    TestBed.inject(HttpTestingController).expectOne(`${path}/sessions`).flush(participant);
    await pending;
    fixture.detectChanges();
  }
  it('requires synthetic adult acknowledgement and starts with all purpose choices unselected', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    await component.start(offer);
    expect(component.error()).toBe('invalid');
    await start(fixture);
    expect(component.choices.getRawValue().map((c) => c.decision)).toEqual(['', '']);
    const radios = Array.from(
      fixture.nativeElement.querySelectorAll('input[type=radio]'),
    ) as HTMLInputElement[];
    expect(radios).toHaveLength(4);
    expect(radios.every((r) => !r.checked)).toBe(true);
  });
  it('offers equally styled allow/decline and submit/decline-all actions with independent purpose groups', async () => {
    const fixture = open();
    await start(fixture);
    const radios = Array.from(
      fixture.nativeElement.querySelectorAll('input[type=radio]'),
    ) as HTMLInputElement[];
    radios[0]!.click();
    radios[3]!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.choices.getRawValue().map((c) => c.decision)).toEqual([
      'allow',
      'decline',
    ]);
    expect(radios[0]!.checked).toBe(true);
    expect(radios[3]!.checked).toBe(true);
    const buttons = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
    ) as HTMLButtonElement[];
    const selected = buttons.find((b) => b.textContent?.includes('Record selected choices')),
      decline = buttons.find((b) => b.textContent?.includes('Decline all and record'));
    expect(selected?.className).toBe(decline?.className);
  });
  it('prevents native form navigation before recording choices from an actual submit event', async () => {
    const fixture = open();
    await start(fixture);
    const component = fixture.componentInstance;
    component.choiceAcknowledged.setValue(true);
    component.choices.controls.forEach((row) => row.controls.decision.setValue('decline'));
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector(
      '[aria-labelledby="participant-heading"] form',
    ) as HTMLFormElement;
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    const request = await vi.waitFor(() =>
      TestBed.inject(HttpTestingController).expectOne(`${path}/sessions/${participant.id}/choices`),
    );
    request.flush(receipt);
    await vi.waitFor(() => expect(component.latest()?.id).toBe(receipt.id));
  });
  it('refreshes the participant receipt version so a stale withdrawal can recover', async () => {
    const fixture = open(),
      component = fixture.componentInstance,
      http = TestBed.inject(HttpTestingController);
    component.participant.set({ ...participant, version: 1, receipts: [receipt] });
    const pending = component.load();
    flushLoad();
    http
      .expectOne(`${path}/sessions/${participant.id}`)
      .flush({ ...participant, version: 2, receipts: [{ ...receipt, version: 2 }] });
    await pending;
    expect(component.participant()?.version).toBe(2);
  });
  it('allows another sample after an expired session cannot be ended', async () => {
    const fixture = open();
    await start(fixture);
    const component = fixture.componentInstance,
      pending = component.end();
    TestBed.inject(HttpTestingController)
      .expectOne(`${path}/sessions/${participant.id}/end`)
      .flush({}, { status: 403, statusText: 'Expired' });
    await pending;
    expect(component.participant()).toBeNull();
    expect(component.error()).toBe('expired');
  });
  it('rejects incomplete choices and missing acknowledgement without a request', async () => {
    const fixture = open();
    await start(fixture);
    const component = fixture.componentInstance;
    await component.submit();
    expect(component.error()).toBe('invalid');
    component.choiceAcknowledged.setValue(true);
    await component.submit();
    expect(component.error()).toBe('invalid');
  });
  it('records partial choices, exact version binding and interface language independently from notice language', async () => {
    const fixture = open();
    await start(fixture);
    const component = fixture.componentInstance;
    component.i.locale.set('hi');
    component.choices.controls[0]!.controls.decision.setValue('allow');
    component.choices.controls[1]!.controls.decision.setValue('decline');
    component.choiceAcknowledged.setValue(true);
    const pending = component.submit();
    const request = await vi.waitFor(() =>
      TestBed.inject(HttpTestingController).expectOne(`${path}/sessions/${participant.id}/choices`),
    );
    expect(request.request.body).toMatchObject({
      offerId: offer.id,
      offerVersion: 2,
      catalogHash: offer.catalogHash,
      interfaceLanguage: 'hi',
      choices: receipt.choices,
    });
    request.flush(receipt);
    await pending;
    fixture.detectChanges();
    expect(component.latest()?.offer.notice.language).toBe('en');
    expect(fixture.nativeElement.textContent).toContain('काल्पनिक');
    expect(fixture.nativeElement.querySelector('[lang="en"]')).toBeTruthy();
  });
  it('decline-all explicitly records every purpose as declined without assuming prior choices', async () => {
    const fixture = open();
    await start(fixture);
    const component = fixture.componentInstance;
    component.choiceAcknowledged.setValue(true);
    const pending = component.submit(true);
    const request = await vi.waitFor(() =>
      TestBed.inject(HttpTestingController).expectOne(`${path}/sessions/${participant.id}/choices`),
    );
    expect(
      request.request.body.choices.every((c: { decision: string }) => c.decision === 'decline'),
    ).toBe(true);
    request.flush({
      ...receipt,
      choices: receipt.choices.map((c) => ({ ...c, decision: 'decline' })),
    });
    await pending;
    expect(component.allowed()).toEqual([]);
  });
  it('preserves choices and reuses the command key after an uncertain failure', async () => {
    const fixture = open();
    await start(fixture);
    const component = fixture.componentInstance;
    component.choiceAcknowledged.setValue(true);
    component.choices.controls.forEach((row) => row.controls.decision.setValue('decline'));
    const first = component.submit();
    const http = TestBed.inject(HttpTestingController),
      request = await vi.waitFor(() =>
        http.expectOne(`${path}/sessions/${participant.id}/choices`),
      ),
      key = request.request.body.idempotencyKey;
    request.flush({}, { status: 503, statusText: 'Unavailable' });
    await first;
    expect(component.choices.getRawValue().map((c) => c.decision)).toEqual(['decline', 'decline']);
    const retry = component.submit();
    const second = await vi.waitFor(() =>
      http.expectOne(`${path}/sessions/${participant.id}/choices`),
    );
    expect(second.request.body.idempotencyKey).toBe(key);
    second.flush(receipt);
    await retry;
    expect(component.participant()?.version).toBe(1);
  });
  it('handles expired and changed version responses without converting choices into success', async () => {
    const fixture = open();
    await start(fixture);
    const component = fixture.componentInstance;
    component.choiceAcknowledged.setValue(true);
    for (const [status, key] of [
      [409, 'conflict'],
      [403, 'expired'],
    ] as const) {
      const pending = component.submit(true);
      const rejected = await vi.waitFor(() =>
        TestBed.inject(HttpTestingController).expectOne(
          `${path}/sessions/${participant.id}/choices`,
        ),
      );
      rejected.flush({}, { status, statusText: 'Rejected' });
      await pending;
      expect(component.error()).toBe(key);
      expect(component.latest()).toBeUndefined();
    }
  });
  it('withdrawal appends history while retaining original receipt and explicit deletion-not-performed text', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    component.participant.set({ ...participant, version: 1, receipts: [receipt] });
    const pending = component.withdraw(['purpose-one']);
    const request = await vi.waitFor(() =>
      TestBed.inject(HttpTestingController).expectOne(
        `${path}/sessions/${participant.id}/withdraw`,
      ),
    );
    expect(request.request.body).toMatchObject({ version: 1, purposeIds: ['purpose-one'] });
    request.flush({
      ...receipt,
      id: 'receipt-two',
      version: 2,
      kind: 'choices_withdrawn',
      previousReceiptHash: receipt.receiptHash,
      choices: receipt.choices.map((c) => ({ ...c, decision: 'decline' })),
    });
    await pending;
    fixture.detectChanges();
    expect(component.participant()?.receipts).toHaveLength(2);
    expect(component.participant()?.receipts[1]).toEqual(receipt);
    expect(fixture.nativeElement.textContent).toContain('does not delete');
  });
  it('viewers cannot see owner configuration or start/mutate participants; staff cannot configure catalogs', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    role('viewer');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Read-only role');
    expect(fixture.nativeElement.querySelector('input[type=checkbox]')).toBeNull();
    await component.start(offer);
    await component.create();
    role('staff');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Owner: create');
  });
  it('ignores a late participant response after changing tenants and clears unsaved input', async () => {
    const fixture = open(),
      component = fixture.componentInstance;
    component.adultAcknowledged.setValue(true);
    const pending = component.start(offer);
    const request = TestBed.inject(HttpTestingController).expectOne(`${path}/sessions`);
    params.next(convertToParamMap({ tenantId: 'other' }));
    flushLoad('other');
    request.flush(participant);
    await pending;
    expect(component.tenantId()).toBe('other');
    expect(component.participant()).toBeNull();
    expect(component.adultAcknowledged.value).toBe(false);
  });
  it('English and Hindi purpose forms have no automated accessibility violations', async () => {
    const fixture = open();
    await start(fixture);
    for (const language of ['en', 'hi'] as const) {
      fixture.componentInstance.i.locale.set(language);
      fixture.detectChanges();
      const results = await axe.run(fixture.nativeElement, {
        rules: { 'color-contrast': { enabled: false } },
      });
      expect(results.violations).toEqual([]);
    }
  });
});
