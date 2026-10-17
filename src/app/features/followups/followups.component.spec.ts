import { vi } from 'vitest';
import { registerLocaleData } from '@angular/common';
import hindiLocale from '@angular/common/locales/hi';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import axe from 'axe-core';
import type {
  FollowupTask,
  FollowupDetail,
  FollowupEvent,
  ConsentReceipt,
} from '@sahmati/contracts';
import { Api } from '../../core/api.service';
import { FollowupsComponent } from './followups.component';
import { followupReferences } from './followups.forms';
registerLocaleData(hindiLocale);
const tenant = 'followups-test',
  path = `/api/tenants/${tenant}/followups`;
const task: FollowupTask = {
  id: 'task-one',
  receiptId: 'receipt-one',
  receiptHash: 'a'.repeat(64),
  sessionId: 'session-one',
  noticeId: 'notice-one',
  entryVersion: 3,
  withdrawnPurposeIds: ['purpose-one'],
  location: {
    key: 'b'.repeat(64),
    kind: 'vendor',
    name: 'Synthetic vendor',
    detail: 'Synthetic service',
    mapping: 'declared',
  },
  status: 'pending',
  version: 1,
  responsibleRole: 'owner',
  assignee: null,
  declaredBy: null,
  declaredEvidence: [],
  retentionNote: 'Unreviewed sample retention',
  updatedAt: '2026-10-17T00:00:00Z',
  mode: 'local-sample',
  applicability: 'unreviewed-candidate',
};
const event: FollowupEvent = {
  version: 1,
  action: 'created',
  actorId: 'synthetic-owner',
  occurredAt: task.updatedAt,
  note: 'Synthetic creation',
  evidenceRefs: [],
  previousHash: null,
  eventHash: 'c'.repeat(64),
  task,
};
const detail: FollowupDetail = { ...task, history: [event] };
const receipt = {
  id: task.receiptId,
  kind: 'choices_withdrawn',
  syntheticReference: 'Sample adult one',
} as ConsentReceipt;
describe('Withdrawal follow-up', () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    params = new BehaviorSubject(convertToParamMap({ tenantId: tenant }));
    TestBed.configureTestingModule({
      imports: [FollowupsComponent],
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
      displayName: 'Sample',
      memberships: [{ tenantId: tenant, name: 'Synthetic', branch: 'Branch', role: value }],
    });
  }
  function flushLoad(selected: FollowupDetail | null = null, selectedTenant = tenant) {
    const http = TestBed.inject(HttpTestingController),
      prefix = `/api/tenants/${selectedTenant}`;
    http.expectOne(`${prefix}/followups`).flush([selected ?? task]);
    http
      .expectOne(`${prefix}/followups/assignees`)
      .flush([{ id: 'staff-id', displayName: 'Synthetic staff', role: 'staff' }]);
    const request = http.match(`${prefix}/consent-sandbox/receipts`);
    request.forEach((r) => r.flush([receipt]));
    if (selected) http.expectOne(`${prefix}/followups/${selected.id}`).flush(selected);
  }
  async function open() {
    const fixture = TestBed.createComponent(FollowupsComponent);
    flushLoad();
    await vi.waitFor(() => expect(fixture.componentInstance.loading()).toBe(false));
    fixture.detectChanges();
    return fixture;
  }
  async function select(fixture: Awaited<ReturnType<typeof open>>, value = detail) {
    const pending = fixture.componentInstance.select(value.id);
    flushLoad(value);
    await pending;
    fixture.detectChanges();
  }
  function fill(fixture: Awaited<ReturnType<typeof open>>, action = 'block') {
    fixture.componentInstance.form.patchValue({
      action: action as 'block',
      note: 'Synthetic rationale',
      references: 'sample-evidence:fixture',
      ack: true,
    });
    fixture.detectChanges();
  }
  it('shows candidate/unknown/manual outcome distinctions without suggesting complete external deletion', async () => {
    const fixture = await open();
    await select(fixture);
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('candidates needing applicability review');
    expect(text).toContain('not independent verification');
    expect(text).toContain('does not prove external deletion');
    expect(text).toContain('Unreviewed sample retention');
    expect(text).toContain('Immutable task history');
  });
  it('rejects missing acknowledgement and unsafe/manual reference formats without a request', async () => {
    const fixture = await open();
    await select(fixture);
    await fixture.componentInstance.act();
    expect(fixture.componentInstance.error()).toBe('invalid');
    fill(fixture);
    for (const references of [
      'https://example.test/proof',
      'file:///tmp/proof',
      'sample-evidence:../../private',
    ]) {
      fixture.componentInstance.form.controls.references.setValue(references);
      await fixture.componentInstance.act();
      expect(fixture.componentInstance.error()).toBe('invalid');
    }
    expect(followupReferences('sample-evidence:one\nsample-evidence:one')).toBeNull();
  });
  it('records a task action against the saved version then refreshes actual detail/history', async () => {
    const fixture = await open();
    await select(fixture);
    fill(fixture, 'record_request');
    const component = fixture.componentInstance,
      pending = component.act();
    const request = await vi.waitFor(() =>
      TestBed.inject(HttpTestingController).expectOne(`${path}/${task.id}/actions`),
    );
    expect(request.request.body).toMatchObject({
      version: 1,
      action: 'record_request',
      note: 'Synthetic rationale',
      evidenceRefs: ['sample-evidence:fixture'],
      syntheticOnlyAcknowledged: true,
    });
    const saved = { ...detail, status: 'request_recorded' as const, version: 2 };
    request.flush(saved);
    await vi.waitFor(() => expect(component.busy()).toBe(false));
    flushLoad(saved);
    await pending;
    expect(component.selected()?.status).toBe('request_recorded');
    expect(component.status()).toBe('saved');
  });
  it('preserves note/references and reuses an idempotency key after uncertain failure', async () => {
    const fixture = await open();
    await select(fixture);
    fill(fixture);
    const component = fixture.componentInstance,
      first = component.act();
    const http = TestBed.inject(HttpTestingController),
      request = await vi.waitFor(() => http.expectOne(`${path}/${task.id}/actions`)),
      key = request.request.body.idempotencyKey;
    request.flush({}, { status: 503, statusText: 'Unavailable' });
    await first;
    expect(component.form.controls.note.value).toBe('Synthetic rationale');
    const retry = component.act(),
      second = await vi.waitFor(() => http.expectOne(`${path}/${task.id}/actions`));
    expect(second.request.body.idempotencyKey).toBe(key);
    second.flush({}, { status: 503, statusText: 'Unavailable' });
    await retry;
  });
  it('handles concurrent-version and independent-review denial without reporting success', async () => {
    const fixture = await open();
    await select(fixture);
    fill(fixture);
    const component = fixture.componentInstance;
    for (const [status, key] of [
      [409, 'conflict'],
      [403, 'forbidden'],
    ] as const) {
      const pending = component.act();
      const request = await vi.waitFor(() =>
        TestBed.inject(HttpTestingController).expectOne(`${path}/${task.id}/actions`),
      );
      request.flush({}, { status, statusText: 'Rejected' });
      await pending;
      expect(component.error()).toBe(key);
      expect(component.status()).toBe('');
      expect(component.selected()?.version).toBe(1);
    }
  });
  it('owner assignment carries explicit person or owner responsibility, never a fabricated recipient', async () => {
    const fixture = await open();
    await select(fixture);
    fill(fixture, 'assign');
    const component = fixture.componentInstance;
    component.form.controls.assigneeId.setValue('staff-id');
    const pending = component.act(),
      request = await vi.waitFor(() =>
        TestBed.inject(HttpTestingController).expectOne(`${path}/${task.id}/actions`),
      );
    expect(request.request.body.assigneeId).toBe('staff-id');
    request.flush({
      ...task,
      version: 2,
      assignee: { id: 'staff-id', displayName: 'Synthetic staff', role: 'staff' },
      responsibleRole: 'staff',
    });
    await vi.waitFor(() => expect(component.busy()).toBe(false));
    flushLoad({
      ...detail,
      version: 2,
      assignee: { id: 'staff-id', displayName: 'Synthetic staff', role: 'staff' },
      responsibleRole: 'staff',
    });
    await pending;
    expect(component.selected()?.responsibleRole).toBe('staff');
  });
  it('unknown tasks cannot offer request, completion, verification or retention actions', async () => {
    const fixture = await open();
    await select(fixture, {
      ...detail,
      status: 'unknown',
      location: { ...task.location, kind: 'unmapped', name: 'other', mapping: 'unknown' },
    });
    expect(fixture.componentInstance.actions()).toEqual(['assign', 'block']);
    expect(fixture.nativeElement.textContent).toContain('inventory completeness unknown');
  });
  it('viewers have no action/reconciliation forms and staff cannot choose owner review/assignment', async () => {
    const fixture = await open();
    await select(fixture);
    role('viewer');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(fixture.componentInstance.actions()).toEqual([]);
    await fixture.componentInstance.act();
    role('staff');
    fixture.detectChanges();
    expect(fixture.componentInstance.actions()).not.toContain('assign');
    expect(fixture.componentInstance.actions()).not.toContain('verify');
    expect(fixture.componentInstance.actions()).not.toContain('retain');
  });
  it('older receipt reconciliation is explicit and idempotent before loading the created task', async () => {
    const fixture = await open(),
      component = fixture.componentInstance;
    await component.create();
    expect(component.error()).toBe('invalid');
    component.receiptId.setValue(receipt.id);
    component.createAcknowledged.setValue(true);
    const pending = component.create(),
      request = await vi.waitFor(() =>
        TestBed.inject(HttpTestingController).expectOne(`${path}/from-receipt`),
      );
    expect(request.request.body).toMatchObject({
      receiptId: receipt.id,
      syntheticOnlyAcknowledged: true,
    });
    request.flush([task]);
    await vi.waitFor(() => expect(component.busy()).toBe(false));
    flushLoad(detail);
    await pending;
    expect(component.selected()?.receiptId).toBe(receipt.id);
  });
  it('prevents native form submission and renders evidence references as text rather than links', async () => {
    const fixture = await open();
    await select(fixture, {
      ...detail,
      history: [
        {
          ...event,
          evidenceRefs: ['sample-evidence:fixture'],
          note: '<script>synthetic text</script>',
        },
      ],
    });
    fill(fixture);
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement,
      eventObject = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(eventObject);
    expect(eventObject.defaultPrevented).toBe(true);
    const request = await vi.waitFor(() =>
      TestBed.inject(HttpTestingController).expectOne(`${path}/${task.id}/actions`),
    );
    request.flush({}, { status: 400, statusText: 'Rejected' });
    await vi.waitFor(() => expect(fixture.componentInstance.busy()).toBe(false));
    expect(fixture.nativeElement.querySelector('script')).toBeNull();
    expect(fixture.nativeElement.querySelector('code')?.textContent).toBe(
      'sample-evidence:fixture',
    );
    expect(fixture.nativeElement.querySelector('a[href^="sample-evidence"]')).toBeNull();
  });
  it('ignores late detail data after tenant navigation and clears stale forms', async () => {
    const fixture = await open(),
      component = fixture.componentInstance,
      pending = component.select(task.id);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(path).flush([task]);
    http.expectOne(`${path}/assignees`).flush([]);
    http.expectOne(`/api/tenants/${tenant}/consent-sandbox/receipts`).flush([]);
    const old = http.expectOne(`${path}/${task.id}`);
    params.next(convertToParamMap({ tenantId: 'other' }));
    flushLoad(null, 'other');
    old.flush(detail);
    await pending;
    expect(component.selected()).toBeNull();
    expect(component.tenantId()).toBe('other');
  });
  it('English and Hindi task detail/action flow has no automated structural accessibility violations', async () => {
    const fixture = await open();
    await select(fixture);
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
